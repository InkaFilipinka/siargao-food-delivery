"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseUnits, formatUnits, JsonRpcSigner, Eip1193Provider } from "ethers";
import { useExchangeRate, convertPHPtoUSD, formatUSDC } from "@/hooks/useExchangeRate";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountPhp: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  onSuccess: (txHash?: string) => void;
  onError: (error: string) => void;
}

const STABLECOIN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const STABLECOIN_CONTRACTS = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  bsc: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
} as const;

const CHAIN_INFO = {
  ethereum: { name: "Ethereum", chainId: "0x1", chainIdNum: 1, token: "USDC" },
  bsc: { name: "BSC (BNB Chain)", chainId: "0x38", chainIdNum: 56, token: "BUSD" },
} as const;

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export function CryptoPaymentModal({
  isOpen,
  onClose,
  amountPhp,
  orderId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}: CryptoPaymentModalProps) {
  const [selectedChain, setSelectedChain] = useState<keyof typeof STABLECOIN_CONTRACTS>("ethereum");
  const [amountUSD, setAmountUSD] = useState(0);
  const [amountUSDC, setAmountUSDC] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"loading" | "chain-select" | "wallet-select" | "confirm" | "processing" | "success">("loading");
  const [selectedWallet, setSelectedWallet] = useState<"metamask" | "trustwallet" | "walletconnect" | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [wcProvider, setWcProvider] = useState<Eip1193Provider | null>(null);

  const recipientAddress = process.env.NEXT_PUBLIC_METAMASK_WALLET_ADDRESS || "";
  const { rate: exchangeRate, isLoading: rateLoading } = useExchangeRate();

  useEffect(() => {
    if (!rateLoading) {
      const baseUSD = convertPHPtoUSD(amountPhp, exchangeRate);
      const feePct = Number(process.env.NEXT_PUBLIC_USDC_FEE_PERCENTAGE) || 6;
      const usdWithFee = baseUSD * (1 + feePct / 100);
      setAmountUSD(usdWithFee);
      setAmountUSDC(formatUSDC(usdWithFee));
    }
  }, [amountPhp, exchangeRate, rateLoading]);

  useEffect(() => {
    if (isOpen && step === "loading") {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (!rateLoading && amountUSDC && Number.parseFloat(amountUSDC) > 0) {
          clearInterval(checkInterval);
          setError("");
          setStep("chain-select");
          return;
        }
        if (attempts >= 20) {
          clearInterval(checkInterval);
          if (exchangeRate > 0 && amountUSDC && Number.parseFloat(amountUSDC) > 0) {
            setError("Using cached rate. Amount may not be up-to-date.");
            setStep("chain-select");
          } else {
            setError("Exchange rate loading timed out. Please close and try again.");
            setStep("chain-select");
          }
        }
      }, 1000);
      return () => clearInterval(checkInterval);
    }
  }, [isOpen, step, amountUSDC, rateLoading, exchangeRate]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("loading");
        setError("");
        setSelectedWallet(null);
        setWalletAddress("");
        setTxHash("");
        setWcProvider(null);
      }, 300);
    }
  }, [isOpen]);

  const connectWallet = async (walletType: "metamask" | "trustwallet" | "walletconnect") => {
    try {
      setError("");
      setSelectedWallet(walletType);

      if (walletType === "walletconnect") {
        const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
        const provider = await EthereumProvider.init({
          projectId: WALLETCONNECT_PROJECT_ID,
          chains: [CHAIN_INFO[selectedChain].chainIdNum],
          optionalChains: [1, 56],
          showQrModal: true,
          metadata: {
            name: "Siargao Food Delivery",
            description: "Food Order Payment",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: [],
          },
        });
        await provider.connect();
        const accounts = provider.accounts;
        if (!accounts.length) throw new Error("No accounts found.");
        setWcProvider(provider as unknown as Eip1193Provider);
        setWalletAddress(accounts[0]);
        setStep("confirm");
        return;
      }

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet detected. Install MetaMask or Trust Wallet, or use WalletConnect.");
      }

      let provider: InstanceType<typeof BrowserProvider>;
      const eth = window.ethereum as { providers?: Array<{ isMetaMask?: boolean; isTrust?: boolean }> };
      if (eth.providers?.length) {
        const wp = walletType === "metamask"
          ? eth.providers.find((p: { isMetaMask?: boolean }) => p.isMetaMask)
          : eth.providers.find((p: { isTrust?: boolean }) => p.isTrust);
        provider = new BrowserProvider((wp as Eip1193Provider) || window.ethereum);
      } else {
        provider = new BrowserProvider(window.ethereum);
      }

      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      if (!accounts.length) throw new Error("No accounts found.");
      setWalletAddress(accounts[0]);
      setStep("confirm");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied")) {
        setError("Connection was cancelled.");
        setStep("wallet-select");
      } else {
        setError(msg);
        onError(msg);
        setStep("wallet-select");
      }
    }
  };

  const switchChain = async (chain: keyof typeof STABLECOIN_CONTRACTS): Promise<boolean> => {
    try {
      if (selectedWallet === "walletconnect" && wcProvider) {
        await wcProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_INFO[chain].chainId }],
        });
        setSelectedChain(chain);
        return true;
      }
      if (typeof window === "undefined" || !window.ethereum) throw new Error("Wallet not installed");
      const eth = window.ethereum as { providers?: Array<{ isMetaMask?: boolean; isTrust?: boolean; request: (a: unknown) => Promise<unknown> }> };
      let ep = window.ethereum;
      if (eth.providers?.length) {
        const wp = selectedWallet === "metamask"
          ? eth.providers.find((p) => p.isMetaMask)
          : eth.providers.find((p) => p.isTrust);
        if (wp) ep = wp;
      }
      await ep.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_INFO[chain].chainId }] });
      setSelectedChain(chain);
      return true;
    } catch (e: unknown) {
      const err = e as { code?: number };
      setError(err.code === 4902 ? `Add ${CHAIN_INFO[chain].name} network` : "Failed to switch chain");
      return false;
    }
  };

  const sendUSDC = async () => {
    try {
      setIsProcessing(true);
      setStep("processing");
      setError("");

      let provider: BrowserProvider | null = null;
      let signer: JsonRpcSigner | null = null;

      if (selectedWallet === "walletconnect" && wcProvider) {
        await wcProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_INFO[selectedChain].chainId }],
        });
        provider = new BrowserProvider(wcProvider as Eip1193Provider);
        signer = await provider.getSigner();
      } else {
        if (typeof window === "undefined" || !window.ethereum) throw new Error("Wallet not found");
        const ok = await switchChain(selectedChain);
        if (!ok) throw new Error(`Switch to ${CHAIN_INFO[selectedChain].name} first`);
        await new Promise((r) => setTimeout(r, 500));
        const eth = window.ethereum as { providers?: Array<{ isMetaMask?: boolean; isTrust?: boolean; request?: (a: unknown) => Promise<unknown> }> };
        let ep: Eip1193Provider = window.ethereum as Eip1193Provider;
        if (eth.providers?.length) {
          const wp = selectedWallet === "metamask" ? eth.providers.find((p) => p.isMetaMask) : eth.providers.find((p) => p.isTrust);
          if (wp) ep = wp as Eip1193Provider;
        }
        provider = new BrowserProvider(ep);
        signer = await provider.getSigner();
      }

      const network = await provider!.getNetwork();
      const expectedId = BigInt(CHAIN_INFO[selectedChain].chainIdNum);
      if (network.chainId !== expectedId) {
        throw new Error(`Switch to ${CHAIN_INFO[selectedChain].name} in your wallet`);
      }

      const tokenAddress = STABLECOIN_CONTRACTS[selectedChain];
      const stablecoinContract = new Contract(tokenAddress, STABLECOIN_ABI, signer);
      const decimals = Number(await stablecoinContract.decimals());
      const parsedAmount = Number.parseFloat(amountUSDC);
      if (isNaN(parsedAmount) || parsedAmount < 0.01) throw new Error("Invalid amount");

      const amountBaseUnits = parseUnits(amountUSDC, decimals);
      if (amountBaseUnits === BigInt(0)) throw new Error("Amount too small");

      const balance = await stablecoinContract.balanceOf(walletAddress);
      if (balance < amountBaseUnits) {
        throw new Error(`Insufficient balance. Need ${amountUSDC} ${CHAIN_INFO[selectedChain].token}`);
      }

      if (!recipientAddress) throw new Error("Recipient not configured. Contact support.");

      const tx = await stablecoinContract.transfer(recipientAddress, amountBaseUnits);
      setTxHash(tx.hash);
      await tx.wait();
      setStep("success");
      onSuccess(tx.hash);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg);
      onError(msg);
      setStep("confirm");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pay with Crypto
              {selectedChain && step !== "loading" && (
                <span className="text-sm font-normal text-slate-600">
                  ({CHAIN_INFO[selectedChain].token} on {CHAIN_INFO[selectedChain].name})
                </span>
              )}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Amount</div>
              {rateLoading ? (
                <div className="text-2xl font-bold text-blue-600 animate-pulse">Calculating...</div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-blue-600">${amountUSDC} USDC</div>
                  <div className="text-sm text-slate-500 mt-1">≈ ₱{amountPhp.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-2">Rate: $1 = ₱{exchangeRate.toFixed(2)}</div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {step === "loading" && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading exchange rate...</p>
            </div>
          )}

          {step === "chain-select" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Step 1: Choose Network</h3>
              <div className="space-y-2">
                {(Object.keys(CHAIN_INFO) as Array<keyof typeof CHAIN_INFO>).map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    disabled={rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                      selectedChain === chain ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="font-semibold">{CHAIN_INFO[chain].name}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                      {CHAIN_INFO[chain].token}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("wallet-select")}
                disabled={rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0}
                className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === "wallet-select" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Step 2: Choose Wallet</h3>
              <div className="space-y-2">
                <button
                  onClick={() => connectWallet("metamask")}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 text-left flex items-center gap-4"
                >
                  <span className="text-3xl">🦊</span>
                  <div>
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-sm text-slate-500">Most popular</div>
                  </div>
                </button>
                <button
                  onClick={() => connectWallet("trustwallet")}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 text-left flex items-center gap-4"
                >
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <div className="font-semibold">Trust Wallet</div>
                    <div className="text-sm text-slate-500">Mobile & browser</div>
                  </div>
                </button>
                <button
                  onClick={() => connectWallet("walletconnect")}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 text-left flex items-center gap-4"
                >
                  <span className="text-3xl">🔗</span>
                  <div>
                    <div className="font-semibold">WalletConnect</div>
                    <div className="text-sm text-slate-500">QR code – any wallet</div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setStep("chain-select")}
                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-lg"
              >
                Back
              </button>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <strong>Connected:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Network</span>
                  <span>{CHAIN_INFO[selectedChain].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold">{amountUSDC} {CHAIN_INFO[selectedChain].token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">≈ PHP</span>
                  <span>₱{amountPhp.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("wallet-select")}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 py-3 rounded-lg font-medium"
                >
                  Back
                </button>
                <button
                  onClick={sendUSDC}
                  disabled={isProcessing || rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg"
                >
                  {isProcessing ? "Processing..." : `Send ${amountUSDC} ${CHAIN_INFO[selectedChain].token}`}
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Processing...</h3>
              <p className="text-sm text-slate-500">Confirm in your wallet</p>
              {txHash && <p className="text-xs font-mono mt-2 break-all">{txHash.slice(0, 20)}...</p>}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h3>
              {txHash && (
                <a
                  href={`https://${selectedChain === "bsc" ? "bscscan.com" : "etherscan.io"}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View transaction →
                </a>
              )}
              <button
                onClick={onClose}
                className="mt-6 bg-primary text-primary-foreground font-medium py-3 px-8 rounded-lg"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      providers?: Array<{ isMetaMask?: boolean; isTrust?: boolean; request: (a: unknown) => Promise<unknown> }>;
    };
  }
}
