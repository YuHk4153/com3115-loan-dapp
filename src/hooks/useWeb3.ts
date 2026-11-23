"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("Install MetaMask");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();
      setAccount(await s.getAddress());
      setProvider(p);
      setSigner(s);
    } catch (err: any) {
      setError(err.code === 4001 ? "User rejected" : err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAcc = (accs: string[]) => setAccount(accs[0] ?? null);
    const onChain = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAcc);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAcc);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, []);

  return { account, provider, signer, isConnecting, error, connect };
}