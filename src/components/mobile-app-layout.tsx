"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCustomerAuth } from "@/contexts/customer-auth-context";

interface MenuItemProps {
  icon: string;
  title: string;
  description: string;
  iconBg: string;
  badge?: string;
  onClick?: () => void;
  href?: string;
  titleColor?: string;
  showChevron?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  description,
  iconBg,
  badge,
  onClick,
  href,
  titleColor = "rgba(17, 24, 39, 1)",
  showChevron = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const content = (
    <>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" style={{ width: "18px", height: "18px" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            color: titleColor,
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
        {showChevron && (
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d2c8f4ba-6822-41cd-a948-61701b7fa623.svg"
            alt=""
            style={{ width: "10px", height: "16px" }}
          />
        )}
      </div>
    </>
  );
  const style: React.CSSProperties = {
    width: "100%",
    height: "72px",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    backgroundColor: isHovered ? "rgba(249, 250, 251, 1)" : "transparent",
    border: "none",
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    textAlign: "left",
    position: "relative",
  };
  if (href) {
    return (
      <Link
        href={href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={style}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
      type="button"
    >
      {content}
    </button>
  );
};

export function MobileAppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomerAuth();

  const activeTab =
    pathname === "/account/figma" || pathname?.startsWith("/account")
      ? "account"
      : pathname === "/orders/history" || pathname?.startsWith("/orders")
        ? "orders"
        : "home";

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "20px 0",
      }}
    >
      <div
        style={{
          width: "375px",
          height: "840px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(250, 250, 249, 1)",
          border: "2px solid rgba(206, 212, 218, 1)",
          boxSizing: "border-box",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
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
            zIndex: 10,
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
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                My Account
              </h1>
            </div>
            <button
              type="button"
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
                alt="Settings"
              />
            </button>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: "100px",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
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
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {customer?.name || customer?.email || customer?.phone || "Guest"}
              </div>
              <div
                style={{
                  color: "rgba(75, 85, 99, 1)",
                  fontSize: "14px",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {customer?.email || "—"}
              </div>
              <div
                style={{
                  color: "rgba(107, 114, 128, 1)",
                  fontSize: "12px",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {customer?.phone || "+63 917 123 4567"}
              </div>
            </div>
            <button
              type="button"
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "rgba(13, 148, 136, 1)",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: '"Inter", sans-serif',
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </section>

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
                href="/account"
              />
              <MenuItem
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/dfe41562-d2f0-4280-890a-8804d317673c.svg"
                title="Saved Addresses"
                description="Manage delivery locations"
                iconBg="rgba(219, 234, 254, 1)"
                badge="3"
                href="/checkout"
              />
              <MenuItem
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d2b1e39c-7afb-45da-a99f-e9360d55363d.svg"
                title="Payment Methods"
                description="Cards and wallets"
                iconBg="rgba(220, 252, 231, 1)"
                badge="2"
                href="/checkout"
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
              />
              <MenuItem
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/fd670e6a-7596-4ae3-9909-ab621618a812.svg"
                title="My Reviews"
                description="View your ratings"
                iconBg="rgba(243, 244, 246, 1)"
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
                href="/support"
              />
              <MenuItem
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/15736cea-65ae-480e-8d61-a877f2260d25.svg"
                title="Terms & Privacy"
                description="Legal information"
                iconBg="rgba(243, 244, 246, 1)"
                href="/terms"
              />
              <MenuItem
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1fd93100-e8e1-4997-9f60-5feabe59bb1b.svg"
                title="About TravelGo"
                description="Version 2.1.0"
                iconBg="rgba(243, 244, 246, 1)"
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
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d4f2d885-bff7-44bd-87de-c91c13274a6f.svg"
                title="Logout"
                description="Sign out of your account"
                iconBg="rgba(254, 226, 226, 1)"
                titleColor="rgba(220, 38, 38, 1)"
                showChevron={false}
                onClick={handleLogout}
              />
            </div>
          </div>
        </main>

        <nav
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "375px",
            height: "81px",
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderTop: "1px solid rgba(229, 231, 235, 1)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "0 16px",
            boxSizing: "border-box",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/dbc41769-de46-47ee-bf79-cdfd4c8ad174.svg"
              alt="Home"
              style={{ opacity: activeTab === "home" ? 1 : 0.5 }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: activeTab === "home" ? "rgba(13, 148, 136, 1)" : "rgba(156, 163, 175, 1)",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Home
            </span>
          </Link>
          <Link
            href="/orders/history"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/32323628-e8ab-4680-b9a0-a4ca1c83e9cf.svg"
              alt="Orders"
              style={{ opacity: activeTab === "orders" ? 1 : 0.5 }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: activeTab === "orders" ? "rgba(13, 148, 136, 1)" : "rgba(156, 163, 175, 1)",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Orders
            </span>
          </Link>
          <Link
            href="/account/figma"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/956b7ee0-2f97-48c2-bca3-28234b7a845e.svg"
              alt="Account"
              style={{ filter: activeTab === "account" ? "none" : "grayscale(100%) brightness(1.2)" }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: activeTab === "account" ? "rgba(13, 148, 136, 1)" : "rgba(156, 163, 175, 1)",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Account
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
