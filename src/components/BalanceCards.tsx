// src/components/BalanceCards.tsx
"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LOAN_MANAGER_ADDRESS, LOAN_ABI } from "@/constants/contracts";

export function BalanceCards({ account, provider, refreshKey }: any) {
  const [collateral, setCollateral] = useState("0");
  const [debt, setDebt] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      if (!provider || !account) return;
      try {
        const contract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_ABI, provider);
        const col = await contract.collateralETH(account);
        const dbt = await contract.borrowedTokens(account);
        
        setCollateral(ethers.formatEther(col));
        setDebt(ethers.formatUnits(dbt, 18)); 
      } catch (err) {
        console.error("Error fetching balances:", err);
      }
    };
    fetchData();
  }, [account, provider, refreshKey]); 

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">ETH Collateral</p>
          <p className="text-2xl font-bold text-green-400">{parseFloat(collateral).toFixed(4)} ETH</p>
        </div>
        <div className="text-3xl">💎</div>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">Borrowed Tokens (Debt)</p>
          <p className="text-2xl font-bold text-red-400">{parseFloat(debt).toFixed(2)} LOAN</p>
        </div>
        <div className="text-3xl">📉</div>
      </div>
    </div>
  );
}