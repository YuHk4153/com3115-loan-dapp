"use client";
export function ConnectButton({ account, isConnecting, error, connect }: any) {
  if (account) {
    return (
      <button className="px-4 py-2 bg-green-600 text-white rounded font-mono">
        {account.slice(0, 6)}...{account.slice(-4)}
      </button>
    );
  }
  return (
    <div>
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}