"use client";

import React from "react";

interface AccountScreenProps {
  onNavigate?: (screen: string) => void;
}

const MenuItem: React.FC<{
  icon: string;
  title: string;
  description: string;
  iconBg: string;
  badge?: string;
  onClick?: () => void;
}> = ({ icon, title, description, iconBg, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: "100%",
      height: "72px",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      backgroundColor: "transparent",
      border: "none",
      borderBottom: "1px solid rgba(243, 244, 246, 1)",
      cursor: "pointer",
      textAlign: "left",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: iconBg,
        borderRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "12px",
        flexShrink: 0,
      }}
    >
      <img src={icon} alt="" style={{ width: "18px", height: "18px" }} />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <span
        style={{
          color: "rgba(17, 24, 39, 1)",
          fontSize: "16px",
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500,
          lineHeight: "24px",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </span>
      <span
        style={{
          color: "rgba(107, 114, 128, 1)",
          fontSize: "12px",
          fontFamily: '"Inter", sans-serif',
          fontWeight: 400,
          lineHeight: "16px",
          letterSpacing: "-0.5px",
        }}
      >
        {description}
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {badge && (
        <span
          style={{
            fontSize: "12px",
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            color: "rgba(75, 85, 99, 1)",
          }}
        >
          {badge}
        </span>
      )}
      <img
        src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d2c8f4ba-6822-41cd-a948-61701b7fa623.svg"
        alt=""
        style={{ width: "10px", height: "16px" }}
      />
    </div>
  </button>
);

export function AccountScreen({ onNavigate }: AccountScreenProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "375px",
        minHeight: "840px",
        margin: "0 auto",
        backgroundColor: "rgba(250, 250, 249, 1)",
        fontFamily: '"Inter", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "375px",
          height: "104px",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderBottom: "1px solid rgba(229, 231, 235, 1)",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 16px 16px 16px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6b95a792-c046-4cdc-8c91-0ed1eca7953b.svg"
              alt="TravelGo"
              style={{ width: "28px", height: "28px" }}
            />
            <h1
              style={{
                margin: 0,
                color: "rgba(17, 24, 39, 1)",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              My Account
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("notifications")}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(243, 244, 246, 1)",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/9202e214-bb8d-4f76-aeb4-e5f73c2b0f02.svg"
              alt="Notifications"
              style={{ width: "18px", height: "18px" }}
            />
          </button>
        </div>
      </header>

      {/* Profile Section */}
      <section
        style={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          padding: "24px 16px",
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "64px",
            height: "64px",
            marginRight: "16px",
          }}
        >
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/70c0304a-6405-495d-8b88-733b7c95edef.jpg"
            alt="Profile"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "9999px",
              objectFit: "cover",
            }}
          />
          <button
            type="button"
            style={{
              position: "absolute",
              right: "-4px",
              bottom: "-4px",
              width: "24px",
              height: "24px",
              backgroundColor: "rgba(249, 115, 22, 1)",
              border: "2px solid white",
              borderRadius: "9999px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/a0484201-6c28-4dff-88fb-926eac100379.svg"
              alt="Edit photo"
              style={{ width: "12px" }}
            />
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "rgba(17, 24, 39, 1)",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Maria Santos
          </div>
          <div
            style={{
              color: "rgba(75, 85, 99, 1)",
              fontSize: "14px",
            }}
          >
            maria.santos@gmail.com
          </div>
          <div
            style={{
              color: "rgba(107, 114, 128, 1)",
              fontSize: "12px",
            }}
          >
            +63 917 123 4567
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("personal-info")}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "rgba(13, 148, 136, 1)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Edit
        </button>
      </section>

      {/* Menu Items */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "100px",
        }}
      >
        <div
          style={{
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/14d9d431-4dcd-46f8-a00f-3233475978f5.svg"
              title="Personal Information"
              description="Update your details"
              iconBg="rgba(204, 251, 241, 1)"
              onClick={() => onNavigate?.("personal-info")}
            />
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/dfe41562-d2f0-4280-890a-8804d317673c.svg"
              title="Saved Addresses"
              description="Manage delivery locations"
              iconBg="rgba(219, 234, 254, 1)"
              badge="3"
              onClick={() => onNavigate?.("saved-addresses")}
            />
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d2b1e39c-7afb-45da-a99f-e9360d55363d.svg"
              title="Payment Methods"
              description="Cards and wallets"
              iconBg="rgba(220, 252, 231, 1)"
              badge="2"
              onClick={() => onNavigate?.("payment-methods")}
            />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/27af1b2e-de0c-47ad-83c6-33c6872e39ef.svg"
              title="Notifications"
              description="Manage preferences"
              iconBg="rgba(243, 232, 255, 1)"
              onClick={() => onNavigate?.("notifications")}
            />
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/fd670e6a-7596-4ae3-9909-ab621618a812.svg"
              title="My Reviews"
              description="View your ratings"
              iconBg="rgba(254, 243, 199, 1)"
              onClick={() => onNavigate?.("orders")}
            />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/203a12ea-63d2-4a9b-84c3-17ddbd7bb4d5.svg"
              title="Help & Support"
              description="Get assistance"
              iconBg="rgba(224, 231, 255, 1)"
              onClick={() => onNavigate?.("help-support")}
            />
            <MenuItem
              icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/15736cea-65ae-480e-8d61-a877f2260d25.svg"
              title="Terms & Privacy"
              description="Legal information"
              iconBg="rgba(243, 244, 246, 1)"
              onClick={() => onNavigate?.("help-support")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
