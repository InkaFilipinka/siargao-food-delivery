import { useState, useEffect } from "react";

interface ExchangeRateData {
  rate: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRateData>({
    rate: 56,
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));
        let rate: number | null = null;

        try {
          const response = await fetch("https://open.er-api.com/v6/latest/USD");
          const json = await response.json();
          if (json.rates?.PHP) rate = json.rates.PHP;
        } catch {
          // try next
        }

        if (!rate) {
          try {
            const response = await fetch(
              "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=php"
            );
            const json = await response.json();
            if (json["usd-coin"]?.php) rate = json["usd-coin"].php;
          } catch {
            // try next
          }
        }

        const finalRate = rate ?? 56;
        setData({ rate: finalRate, lastUpdated: new Date(), isLoading: false, error: null });
        if (typeof window !== "undefined") {
          localStorage.setItem("exchangeRate", JSON.stringify({ rate: finalRate, timestamp: Date.now() }));
        }
      } catch (error) {
        console.error("Exchange rate error:", error);
        const cached =
          typeof window !== "undefined" ? localStorage.getItem("exchangeRate") : null;
        if (cached) {
          const { rate } = JSON.parse(cached);
          setData({ rate, lastUpdated: new Date(), isLoading: false, error: "Using cached rate" });
        } else {
          setData({ rate: 56, lastUpdated: new Date(), isLoading: false, error: "Using fallback rate" });
        }
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

export function convertPHPtoUSD(amountPHP: number, rate: number): number {
  return amountPHP / rate;
}

export function formatUSDC(amount: number): string {
  return amount.toFixed(2);
}
