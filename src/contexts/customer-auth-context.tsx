"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Customer {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
}

interface CustomerAuthContextValue {
  customer: Customer | null;
  token: string | null;
  isLoaded: boolean;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
  setCustomer: (c: Customer | null) => void;
}

const CUSTOMER_TOKEN_KEY = "customer_token";
const CUSTOMER_KEY = "customer";

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const t = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      const c = localStorage.getItem(CUSTOMER_KEY);
      if (t && c) {
        setToken(t);
        setCustomerState(JSON.parse(c));
      }
    } catch {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_KEY);
    }
    setIsLoaded(true);
  }, []);

  const login = useCallback((t: string, c: Customer) => {
    setToken(t);
    setCustomerState(c);
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, t);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCustomerState(null);
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const setCustomer = useCallback((c: Customer | null) => {
    setCustomerState(c);
    try {
      if (c) {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
      } else {
        localStorage.removeItem(CUSTOMER_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoaded,
        login,
        logout,
        setCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
