// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract LoanManager {
    IERC20 public immutable token;
    uint256 public constant TOKEN_PRICE = 1000;     // 1 ETH = 1000 Tokens
    uint256 public constant COLLATERAL_RATIO = 150; // 150%

    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public borrowedTokens;

    bool private locked;
    modifier nonReentrant() {
        require(!locked, "Reentrant");
        locked = true;
        _;
        locked = false;
    }

    event CollateralDeposited(address indexed user, uint256 amount);
    event TokensBorrowed(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amountRepaid);
    event CollateralWithdrawn(address indexed user, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function depositCollateral() external payable nonReentrant {
        require(msg.value > 0, "Must deposit ETH");
        collateralETH[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    function borrowTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount > 0");

        uint256 ethValueNeeded = (amount * 1e18 * COLLATERAL_RATIO) / (TOKEN_PRICE * 100);
        require(collateralETH[msg.sender] >= ethValueNeeded, "Not enough collateral");

        uint256 amountWei = amount * 1e18;
        borrowedTokens[msg.sender] += amountWei;

        require(token.transfer(msg.sender, amountWei), "Transfer failed");
        emit TokensBorrowed(msg.sender, amountWei);
    }

    function repayLoan() external nonReentrant {
        uint256 debt = borrowedTokens[msg.sender];
        require(debt > 0, "No loan");

        uint256 totalOwed = debt + (debt * 5) / 100;
        borrowedTokens[msg.sender] = 0;

        require(token.transferFrom(msg.sender, address(this), totalOwed), "Repay failed");
        emit LoanRepaid(msg.sender, totalOwed);
    }

    function withdrawCollateral() external nonReentrant {
        require(borrowedTokens[msg.sender] == 0, "Repay first");

        uint256 amount = collateralETH[msg.sender];
        require(amount > 0, "No collateral");

        collateralETH[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit CollateralWithdrawn(msg.sender, amount);
    }

    function getRequiredCollateral(uint256 amount) external pure returns (uint256) {
        return (amount * 1e18 * COLLATERAL_RATIO) / (TOKEN_PRICE * 100);
    }
}