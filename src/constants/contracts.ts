// REPLACE THESE WITH YOUR GROUPMATE'S ADDRESSES
export const TOKEN_ADDRESS = "0x19E79bC66DC6082d6Ecc93C886ac999546923F6f"; 
export const LOAN_MANAGER_ADDRESS = "0x9563c8e9dcDEA8140686584a852ba345526d6E6C";

export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
] as const;

export const LOAN_ABI = [
  "function depositCollateral() payable",
  "function borrowTokens(uint256 amount)",
  "function repayLoan()",
  "function withdrawCollateral()",
  "function collateralETH(address) view returns (uint256)",
  "function borrowedTokens(address) view returns (uint256)"
] as const;