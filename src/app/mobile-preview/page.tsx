"use client";

import { useMobilePreview, MobileScreen, MobilePreviewProvider } from "@/contexts/mobile-preview-context";
import { FoodDeliveryHero } from "@/components/figma-screens/FoodDeliveryHero";
import { FoodSearchScreen } from "@/components/figma-screens/FoodSearchScreen";
import { ProductCard } from "@/components/figma-screens/ProductCard";
import { CartScreen } from "@/components/figma-screens/CartScreen";
import { CheckoutForm } from "@/components/figma-screens/CheckoutForm";
import { MobileOrderDetails } from "@/components/figma-screens/MobileOrderDetails";
import { OrderStatusCard } from "@/components/figma-screens/OrderStatusCard";
import { MobileAppScreen } from "@/components/figma-screens/MobileAppScreen";
import { ProductOrderCard } from "@/components/figma-screens/ProductOrderCard";
import { DataTableHeader } from "@/components/figma-screens/DataTableHeader";
import { LoginScreen } from "@/components/figma-screens/LoginScreen";
import { useState } from "react";

const SCREENS: { id: MobileScreen; label: string }[] = [
  { id: "landing", label: "Landing" },
  { id: "home", label: "Home (Search)" },
  { id: "restaurant", label: "Restaurant" },
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "track", label: "Track Order" },
  { id: "orders", label: "Order History" },
  { id: "driver-hub", label: "Driver Hub" },
  { id: "driver-earnings", label: "Driver Earnings" },
  { id: "restaurant-dashboard", label: "Restaurant Dashboard" },
  { id: "partner-login", label: "Partner Login" },
];

function MobilePreviewContent() {
  const ctx = useMobilePreview();
  if (!ctx) return <div>Loading...</div>;
  const { screen, goTo } = ctx;
  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleNavigate = (s: string) => goTo(s as MobileScreen);

  const renderScreen = () => {
    switch (screen) {
      case "landing":
        return <FoodDeliveryHero onNavigate={handleNavigate} />;
      case "home":
        return <FoodSearchScreen onNavigate={handleNavigate} />;
      case "restaurant":
        return <ProductCard onNavigate={handleNavigate} />;
      case "cart":
        return <CartScreen onNavigate={handleNavigate} />;
      case "checkout":
        return <CheckoutForm onNavigate={handleNavigate} />;
      case "track":
        return <MobileOrderDetails onNavigate={handleNavigate} />;
      case "orders":
        return <OrderStatusCard onNavigate={handleNavigate} />;
      case "driver-hub":
        return <MobileAppScreen onNavigate={handleNavigate} />;
      case "driver-earnings":
        return <ProductOrderCard onNavigate={handleNavigate} />;
      case "restaurant-dashboard":
        return <DataTableHeader onNavigate={handleNavigate} />;
      case "partner-login":
        return (
          <LoginScreen
            onBack={() => handleNavigate("landing")}
            onSignIn={(data) => {
              const role = data?.role as "driver" | "restaurant";
              handleNavigate(role === "driver" ? "driver-hub" : "restaurant-dashboard");
            }}
            onForgotPassword={() => {}}
            onSignUp={() => {}}
            onSocialLogin={() => {}}
          />
        );
      default:
        return <FoodDeliveryHero onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex flex-col items-center py-8">
      {/* Screen switcher - floating button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowSwitcher(!showSwitcher)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-lg text-sm font-medium hover:bg-teal-700"
        >
          {showSwitcher ? "Hide" : "Screen"} switcher
        </button>
        {showSwitcher && (
          <div className="absolute top-full right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 p-2">
            {SCREENS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  handleNavigate(s.id);
                  setShowSwitcher(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded text-sm ${
                  screen === s.id ? "bg-teal-100 text-teal-800 font-medium" : "hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone frame */}
      <div className="relative rounded-2xl shadow-2xl border-4 border-gray-300 overflow-hidden bg-gray-100">
        <div className="w-[375px] min-h-[600px] max-h-[90vh] overflow-y-auto overscroll-contain">
          {renderScreen()}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Click through the app or use the screen switcher to jump between flows
      </p>
    </div>
  );
}

export default function MobilePreviewPage() {
  return (
    <MobilePreviewProvider>
      <div className="mobile-preview-root min-h-screen bg-neutral-200">
        <MobilePreviewContent />
      </div>
    </MobilePreviewProvider>
  );
}
