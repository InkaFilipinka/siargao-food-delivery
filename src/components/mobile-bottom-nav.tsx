"use client";

import React, { useState } from "react";

const tapAnimation = {
  transition: "transform 0.15s ease",
} as React.CSSProperties;

const NavButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        padding: "8px 0",
        width: "56px",
        ...tapAnimation,
        transform: pressed ? "scale(0.92)" : "scale(1)",
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
};

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/14649436-96e8-4ea7-865a-834a1f5b7f8b.svg" },
  { id: "orders", label: "Orders", icon: "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/80069351-0f00-442f-acab-1699edd85cf5.svg" },
  { id: "cart", label: "View Cart", icon: "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/166c1b62-1a3e-4bcb-9c66-ea53dead3040.svg" },
  { id: "checkout", label: "Checkout", icon: "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6e9c9c65-6cef-4478-b9fa-ce3baf117223.svg" },
  { id: "account", label: "Account", icon: "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/7f941418-5915-40c6-8e55-62d6db52b58a.svg" },
] as const;

interface MobileBottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function MobileBottomNav({ currentScreen, onNavigate }: MobileBottomNavProps) {
  const isActive = (id: string) => {
    const map: Record<string, string[]> = {
      home: ["landing", "home", "restaurant", "item-detail"],
      orders: ["orders", "track", "order-detail"],
      cart: ["cart"],
      checkout: ["checkout"],
      account: ["account", "personal-info", "saved-addresses", "payment-methods", "favorites", "help-support", "location-picker", "forgot-password", "sign-up", "support", "notifications", "edit-address", "edit-phone"],
    };
    return map[id as keyof typeof map]?.includes(currentScreen) ?? false;
  };

  return (
    <nav
      style={{
        width: "100%",
        height: "71px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E5E7EB",
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0 16px",
        boxSizing: "border-box",
        zIndex: 20,
      }}
    >
      {NAV_ITEMS.map((tab) => {
        const active = isActive(tab.id);
        return (
          <NavButton key={tab.id} onClick={() => onNavigate(tab.id)}>
            <img
              src={tab.icon}
              alt={tab.label}
              style={{
                width: "20px",
                height: "18px",
                filter: active
                  ? "invert(37%) sepia(85%) saturate(543%) hue-rotate(126deg) brightness(92%) contrast(92%)"
                  : "invert(75%) sepia(6%) saturate(695%) hue-rotate(182deg) brightness(91%) contrast(85%)",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500, color: active ? "#0D9488" : "#9CA3AF" }}>{tab.label}</span>
          </NavButton>
        );
      })}
    </nav>
  );
}
