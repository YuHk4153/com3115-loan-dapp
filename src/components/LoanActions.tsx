// src/components/LoanActions.tsx
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { TOKEN_ADDRESS, LOAN_MANAGER_ADDRESS, TOKEN_ABI, LOAN_ABI } from "@/constants/contracts";

export function LoanActions({ account, signer, onSuccess }: any) {
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("deposit");
  const [status, setStatus] = useState("");

  const handleExecute = async () => {
    if (!account || !signer) return alert("Connect wallet first");
    
    try {
      // 🚨 FORCE SEPOLIA NETWORK 🚨
      const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Hex for 11155111
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          alert("Please add Sepolia Testnet to MetaMask manually.");
          return;
        }
      }

      setStatus("Preparing...");
      const loanContract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_ABI, signer);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      if (action === "deposit") {
        if (!amount) return alert("Enter amount");
        setStatus("Depositing ETH...");
        const tx = await loanContract.depositCollateral({ 
            value: ethers.parseEther(amount),
            gasLimit: 300000 
        });
        await tx.wait();
      } 
      else if (action === "borrow") {
        if (!amount) return alert("Enter amount");
        setStatus("Borrowing tokens...");
        const tx = await loanContract.borrowTokens(amount); 
        await tx.wait();
      } 
      else if (action === "repay") {
        setStatus("Checking debt...");
        const currentDebt = await loanContract.borrowedTokens(account);
        if (currentDebt === 0n) return alert("No debt to repay");
        
        const totalOwed = currentDebt + (currentDebt * 5n) / 100n;

        setStatus("Approving tokens for repayment...");
        const allowance = await tokenContract.allowance(account, LOAN_MANAGER_ADDRESS);
        
        if (allowance < totalOwed) {
            const approveTx = await tokenContract.approve(LOAN_MANAGER_ADDRESS, totalOwed);
            await approveTx.wait();
        }

        setStatus("Repaying loan...");
        const tx = await loanContract.repayLoan();
        await tx.wait();
      }
      else if (action === "withdraw") {
        setStatus("Withdrawing Collateral...");
        const tx = await loanContract.withdrawCollateral();
        await tx.wait();
      }

      setStatus("Success!");
      setAmount(""); 
      if (onSuccess) onSuccess(); 

    } catch (err: any) {
      console.error(err);
      setStatus(err.reason || err.message || "Transaction failed");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Select Action</label>
        <select 
          value={action} 
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none"
        >
          <option value="deposit">Deposit ETH Collateral</option>
          <option value="borrow">Borrow Tokens</option>
          <option value="repay">Repay Loan</option>
          <option value="withdraw">Withdraw Collateral</option>
        </select>
      </div>

      {(action === "deposit" || action === "borrow") && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none"
          />
        </div>
      )}

      <button 
        onClick={handleExecute}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
      >
        Execute {action.charAt(0).toUpperCase() + action.slice(1)}
      </button>
      {status && <p className="text-sm mt-2 text-yellow-400 font-bold">{status}</p>}
    </div>
  );
}