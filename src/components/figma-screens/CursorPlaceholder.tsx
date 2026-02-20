"use client";

import React from "react";

type CursorScreenId =
  | "account"
  | "location-picker"
  | "forgot-password"
  | "sign-up"
  | "order-detail"
  | "item-detail"
  | "support"
  | "notifications"
  | "edit-address"
  | "edit-phone"
  | "payout-settings"
  | "trip-history";

interface CursorPlaceholderProps {
  screenId: CursorScreenId;
  title: string;
  onBack?: () => void;
}

const BackArrow = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
    <path d="M13 8H1M1 8L8 15M1 8L8 1" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CURSOR_BADGE = (
  <div
    style={{
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
);

function ListItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px",
        backgroundColor: "#FFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: "16px", color: "#111827" }}>{label}</span>
      <span style={{ color: "#9CA3AF", fontSize: "14px" }}>›</span>
    </div>
  );
}

function AccountScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Account</h1>
      </header>
      <div style={{ padding: "16px 0" }}>
        <div style={{ padding: "20px", backgroundColor: "#FFF", margin: "0 16px 16px", borderRadius: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#0D9488", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>J</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Juan Dela Cruz</div>
              <div style={{ fontSize: 14, color: "#6B7280" }}>juan@example.com</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "#FFF", borderTop: "1px solid #E5E7EB" }}>
          <ListItem label="Personal Information" />
          <ListItem label="Saved Addresses" />
          <ListItem label="Payment Methods" />
          <ListItem label="Order History" />
          <ListItem label="Favorites" />
          <ListItem label="Notifications" />
          <ListItem label="Help & Support" />
        </div>
      </div>
    </div>
  );
}

function LocationPickerScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Select Location</h1>
      </header>
      <div style={{ padding: "16px" }}>
        <div style={{ height: 200, backgroundColor: "#E5E7EB", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", marginBottom: 16 }}>Map placeholder</div>
        <div style={{ backgroundColor: "#FFF", borderRadius: "12px", padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Deliver to</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>General Luna, Siargao</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Cloud 9 Road, near surf break</div>
        </div>
        <button style={{ width: "100%", marginTop: 16, padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Use current location</button>
      </div>
    </div>
  );
}

function ForgotPasswordScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Forgot Password</h1>
      </header>
      <div style={{ padding: "24px" }}>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Enter your email and we&apos;ll send you a link to reset your password.</p>
        <input placeholder="Email address" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 16, boxSizing: "border-box" }} />
        <button style={{ width: "100%", padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Send reset link</button>
      </div>
    </div>
  );
}

function SignUpScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Create Account</h1>
      </header>
      <div style={{ padding: "24px" }}>
        <input placeholder="Full name" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }} />
        <input placeholder="Email" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }} />
        <input placeholder="Password" type="password" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 24, boxSizing: "border-box" }} />
        <button style={{ width: "100%", padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Sign Up</button>
      </div>
    </div>
  );
}

function OrderDetailScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Order #ORD-2024-001</h1>
      </header>
      <div style={{ padding: "16px" }}>
        <div style={{ backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 14, color: "#6B7280" }}>Siargao Beach Cafe • Jan 15, 2024</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>2x Chicken Adobo Bowl</div>
          <div style={{ fontSize: 14, color: "#6B7280" }}>1x Fresh Coconut Water</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12, color: "#0D9488" }}>₱485.00</div>
        </div>
        <button style={{ width: "100%", padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", marginRight: 8 }}>Reorder</button>
        <button style={{ width: "100%", padding: 16, backgroundColor: "#FFF", color: "#111827", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>View receipt</button>
      </div>
    </div>
  );
}

function ItemDetailScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Grilled Lapu-Lapu</h1>
      </header>
      <div style={{ padding: "16px" }}>
        <div style={{ height: 200, backgroundColor: "#E5E7EB", borderRadius: 12, marginBottom: 16 }} />
        <div style={{ fontSize: 14, color: "#6B7280" }}>Fresh grouper grilled with island spices, served with garlic rice</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>₱450</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button style={{ flex: 1, padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}

function SupportScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Support</h1>
      </header>
      <div style={{ padding: "16px 0" }}>
        <div style={{ backgroundColor: "#FFF", borderTop: "1px solid #E5E7EB" }}>
          <ListItem label="Chat with support" />
          <ListItem label="Call rider" />
          <ListItem label="Report an issue" />
          <ListItem label="FAQ" />
          <ListItem label="Contact us" />
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Notifications</h1>
      </header>
      <div style={{ padding: "16px" }}>
        {["Order #2847 is ready for pickup", "Your delivery is on the way", "Earned ₱120 from today's trips"].map((msg, i) => (
          <div key={i} style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 12, marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", borderLeft: "4px solid #0D9488" }}>
            <div style={{ fontSize: 14, color: "#111827" }}>{msg}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Just now</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditAddressScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Edit Address</h1>
      </header>
      <div style={{ padding: "24px" }}>
        <input placeholder="Street address" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }} />
        <input placeholder="Barangay / Landmark" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }} />
        <input placeholder="City / Municipality" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 24, boxSizing: "border-box" }} />
        <button style={{ width: "100%", padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Save address</button>
      </div>
    </div>
  );
}

function EditPhoneScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Edit Phone</h1>
      </header>
      <div style={{ padding: "24px" }}>
        <input placeholder="+63 9XX XXX XXXX" style={{ width: "100%", padding: 16, border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 16, marginBottom: 24, boxSizing: "border-box" }} />
        <button style={{ width: "100%", padding: 16, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Save</button>
      </div>
    </div>
  );
}

function PayoutSettingsScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Payout Settings</h1>
      </header>
      <div style={{ padding: "16px" }}>
        <div style={{ backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Bank account</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>•••• •••• 1234</div>
        </div>
        <div style={{ backgroundColor: "#FFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Payout schedule</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: 12, backgroundColor: "#0D9488", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Daily</button>
            <button style={{ flex: 1, padding: 12, backgroundColor: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Weekly</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TripHistoryScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
      {CURSOR_BADGE}
      <header style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BackArrow />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Trip History</h1>
      </header>
      <div style={{ padding: "16px" }}>
        {[
          { id: "#2847", from: "Siargao Bowl Co.", to: "Cloud 9", amount: "₱120" },
          { id: "#2846", from: "Island Grill", to: "General Luna", amount: "₱95" },
        ].map((t, i) => (
          <div key={i} style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 12, marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Order {t.id}</div>
            <div style={{ fontSize: 14, color: "#6B7280" }}>{t.from} → {t.to}</div>
            <div style={{ fontSize: 14, color: "#0D9488", fontWeight: 600 }}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREEN_COMPONENTS: Record<CursorScreenId, React.FC<{ onBack?: () => void }>> = {
  account: AccountScreen,
  "location-picker": LocationPickerScreen,
  "forgot-password": ForgotPasswordScreen,
  "sign-up": SignUpScreen,
  "order-detail": OrderDetailScreen,
  "item-detail": ItemDetailScreen,
  support: SupportScreen,
  notifications: NotificationsScreen,
  "edit-address": EditAddressScreen,
  "edit-phone": EditPhoneScreen,
  "payout-settings": PayoutSettingsScreen,
  "trip-history": TripHistoryScreen,
};

export function CursorPlaceholder({ screenId, title, onBack }: CursorPlaceholderProps) {
  const Screen = SCREEN_COMPONENTS[screenId];
  if (!Screen) {
    return (
      <div style={{ width: "100%", maxWidth: "375px", minHeight: "840px", margin: "0 auto", backgroundColor: "#FAFAF9", fontFamily: '"Inter", sans-serif' }}>
        {CURSOR_BADGE}
        <header style={{ padding: "16px" }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer" }}>
              <BackArrow />
            </button>
          )}
          <h1 style={{ margin: 0 }}>{title}</h1>
        </header>
      </div>
    );
  }
  return <Screen onBack={onBack} />;
}
