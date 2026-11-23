"use client";
import { useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { ConnectButton } from "@/components/ConnectButton";
import { BalanceCards } from "@/components/BalanceCards";
import { LoanActions } from "@/components/LoanActions";

export default function Home() {
  const web3 = useWeb3();
  const [refreshKey, setRefreshKey] = useState(0); 

  return (
    <main className="min-h-screen p-8 bg-gray-950 text-white font-sans">
      <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">DeFi Lending Protocol</h1>
        <ConnectButton {...web3} />
      </div>

      {web3.account ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Your Portfolio</h2>
            <BalanceCards account={web3.account} provider={web3.provider} refreshKey={refreshKey} />
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-300">Manage Loan</h2>
            <LoanActions account={web3.account} signer={web3.signer} onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-500">
          <p className="text-xl">Please connect your wallet to view your dashboard.</p>
        </div>
      )}
    </main>
  );
}