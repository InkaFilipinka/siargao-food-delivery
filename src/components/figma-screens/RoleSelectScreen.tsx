"use client";

import React from "react";

interface RoleSelectScreenProps {
  onNavigate?: (screen: string) => void;
  onDriverSelect?: () => void;
  onRestaurantSelect?: () => void;
}

const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  white: "#FFFFFF",
  gray100: "#F3F4F6",
  gray500: "#6B7280",
  gray900: "#111827",
  orange: "#F97316",
};

export function RoleSelectScreen({ onNavigate, onDriverSelect, onRestaurantSelect }: RoleSelectScreenProps) {
  const handleCustomer = () => onNavigate?.("landing");
  const handleDriver = () => {
    onDriverSelect?.();
    onNavigate?.("partner-login");
  };
  const handleRestaurant = () => {
    onRestaurantSelect?.();
    onNavigate?.("partner-login");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "375px",
        minHeight: "840px",
        margin: "0 auto",
        backgroundColor: "#FAFAF9",
        fontFamily: '"Inter", sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginTop: "48px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/bb0086f8-cb12-458c-9a03-5ddd73b10ea9.svg"
            alt="TravelGo"
            style={{ width: "40px", height: "40px" }}
          />
          <span style={{ fontSize: "28px", fontWeight: 700, color: COLORS.gray900, letterSpacing: "-0.5px" }}>
            TravelGo
          </span>
        </div>
        <p style={{ fontSize: "14px", color: COLORS.gray500, margin: 0 }}>Siargao Island</p>
      </header>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "18px",
          fontWeight: 500,
          color: COLORS.gray900,
          textAlign: "center",
          marginBottom: "32px",
          lineHeight: "26px",
        }}
      >
        How would you like to use TravelGo?
      </p>

      {/* Role Buttons */}
      <div style={{ width: "100%", maxWidth: "327px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Customer */}
        <button
          onClick={handleCustomer}
          style={{
            width: "100%",
            padding: "20px 24px",
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0px 4px 12px rgba(13, 148, 136, 0.3)",
            transition: "background-color 0.2s, transform 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primaryDark;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primary;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c175cce7-6642-46d6-ad3b-0d642b0d7ad1.svg"
              alt=""
              style={{ width: "24px", height: "24px" }}
            />
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Customer</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Order food from local restaurants</div>
          </div>
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d280898f-2cb4-4793-994d-2321b426781a.svg"
            alt=""
            style={{ width: "20px", height: "20px" }}
          />
        </button>

        {/* Driver */}
        <button
          onClick={handleDriver}
          style={{
            width: "100%",
            padding: "20px 24px",
            backgroundColor: COLORS.white,
            color: COLORS.gray900,
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "border-color 0.2s, background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.backgroundColor = COLORS.white;
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(13, 148, 136, 0.1)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/689fe540-8af9-4819-87ec-60bfb65fcaef.svg"
              alt=""
              style={{ width: "24px", height: "24px" }}
            />
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Driver</div>
            <div style={{ fontSize: "14px", color: COLORS.gray500 }}>Deliver orders and earn</div>
          </div>
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3ae17146-c366-4c62-bf00-b0f230cdc8d0.svg"
            alt=""
            style={{ width: "16px", height: "16px", transform: "rotate(-90deg)" }}
          />
        </button>

        {/* Restaurant */}
        <button
          onClick={handleRestaurant}
          style={{
            width: "100%",
            padding: "20px 24px",
            backgroundColor: COLORS.white,
            color: COLORS.gray900,
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "border-color 0.2s, background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.backgroundColor = COLORS.white;
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/276af12e-7a98-4c2f-9cc7-a211fc688411.svg"
              alt=""
              style={{ width: "24px", height: "24px" }}
            />
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Restaurant</div>
            <div style={{ fontSize: "14px", color: COLORS.gray500 }}>Manage orders and menu</div>
          </div>
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3ae17146-c366-4c62-bf00-b0f230cdc8d0.svg"
            alt=""
            style={{ width: "16px", height: "16px", transform: "rotate(-90deg)" }}
          />
        </button>
      </div>
    </div>
  );
}
