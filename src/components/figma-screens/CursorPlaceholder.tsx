"use client";

import React from "react";

interface CursorPlaceholderProps {
  title: string;
  onBack?: () => void;
  subtitle?: string;
}

/**
 * Temporary placeholder screen. "CURSOR" in red = created for this preview.
 * Screens without it = imported from Figma.
 */
export function CursorPlaceholder({ title, onBack, subtitle }: CursorPlaceholderProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "375px",
        minHeight: "840px",
        margin: "0 auto",
        backgroundColor: "#FAFAF9",
        border: "2px solid #CED4DA",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        fontFamily: '"Inter", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CURSOR badge - red, top */}
      <div
        style={{
          width: "100%",
          padding: "8px 16px",
          backgroundColor: "#FEE2E2",
          borderBottom: "2px solid #DC2626",
          fontSize: "14px",
          fontWeight: 700,
          color: "#DC2626",
          letterSpacing: "0.1em",
        }}
      >
        CURSOR
      </div>

      {/* Header with back */}
      <header
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#F3F4F6",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path d="M13 8H1M1 8L8 15M1 8L8 1" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>{title}</h1>
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6B7280" }}>{subtitle}</p>}
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#6B7280",
          fontSize: "14px",
        }}
      >
        <p>Temporary placeholder. Screen to be designed in Figma.</p>
      </main>
    </div>
  );
}
