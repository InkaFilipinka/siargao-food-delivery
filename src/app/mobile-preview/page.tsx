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
import { RoleSelectScreen } from "@/components/figma-screens/RoleSelectScreen";
import { AccountScreen } from "@/components/figma-screens/AccountScreen";
import { CursorPlaceholder } from "@/components/figma-screens/CursorPlaceholder";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MapPicker } from "@/components/map-picker";
import { MobileRestaurantsProvider } from "@/contexts/mobile-restaurants-context";
import { useState } from "react";

const CUSTOMER_SCREENS_WITH_NAV: MobileScreen[] = [
  "landing", "home", "restaurant", "cart", "checkout", "track", "orders",
  "account", "personal-info", "saved-addresses", "payment-methods", "favorites",
  "help-support", "location-picker", "forgot-password", "sign-up", "order-detail",
  "item-detail", "support", "notifications", "edit-address", "edit-phone",
];

const FIGMA_SCREENS: { id: MobileScreen; label: string }[] = [
  { id: "role-select", label: "Role Select" },
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

const CURSOR_PLACEHOLDERS: { id: MobileScreen; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "personal-info", label: "Personal Information" },
  { id: "saved-addresses", label: "Saved Addresses" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "favorites", label: "Favorites" },
  { id: "help-support", label: "Help & Support" },
  { id: "location-picker", label: "Location Picker" },
  { id: "forgot-password", label: "Forgot Password (CURSOR)" },
  { id: "sign-up", label: "Sign Up (CURSOR)" },
  { id: "order-detail", label: "Order Detail (CURSOR)" },
  { id: "item-detail", label: "Item Detail (CURSOR)" },
  { id: "support", label: "Support (CURSOR)" },
  { id: "notifications", label: "Notifications (CURSOR)" },
  { id: "edit-address", label: "Edit Address (CURSOR)" },
  { id: "edit-phone", label: "Edit Phone (CURSOR)" },
  { id: "payout-settings", label: "Payout Settings (CURSOR)" },
  { id: "trip-history", label: "Trip History (CURSOR)" },
];

const SCREENS = [...FIGMA_SCREENS, ...CURSOR_PLACEHOLDERS];

function MobilePreviewContent() {
  const ctx = useMobilePreview();
  if (!ctx) return <div>Loading...</div>;
  const { screen, goTo, goBack, mapOpen, setMapOpen, deliveryLocation, setDeliveryLocation, setSelectedRestaurantSlug, setPartnerLoginRole } = ctx;
  const [showSwitcher, setShowSwitcher] = useState(false);
  const showGlobalNav = CUSTOMER_SCREENS_WITH_NAV.includes(screen);

  const handleNavigate = (s: string) => goTo(s as MobileScreen);
  const handleOpenMap = () => setMapOpen(true);
  const handleRestaurantSelect = (slug: string) => {
    setSelectedRestaurantSlug(slug);
    goTo("restaurant");
  };

  const renderScreen = () => {
    switch (screen) {
      case "role-select":
        return (
          <RoleSelectScreen
            onNavigate={handleNavigate}
            onDriverSelect={() => setPartnerLoginRole("driver")}
            onRestaurantSelect={() => setPartnerLoginRole("restaurant")}
          />
        );
      case "landing":
        return (
          <FoodDeliveryHero
            onNavigate={handleNavigate}
            onOpenMap={handleOpenMap}
            deliveryLocation={deliveryLocation}
          />
        );
      case "home":
        return (
          <FoodSearchScreen
            onNavigate={handleNavigate}
            onRestaurantSelect={handleRestaurantSelect}
            hideBottomNav={showGlobalNav}
            onOpenMap={handleOpenMap}
            deliveryLocation={deliveryLocation}
          />
        );
      case "restaurant":
        return <ProductCard onNavigate={handleNavigate} hideBottomNav={showGlobalNav} />;
      case "cart":
        return <CartScreen onNavigate={handleNavigate} hideBottomNav={showGlobalNav} />;
      case "checkout":
        return <CheckoutForm onNavigate={handleNavigate} />;
      case "track":
        return <MobileOrderDetails onNavigate={handleNavigate} hideBottomNav={showGlobalNav} />;
      case "orders":
        return <OrderStatusCard onNavigate={handleNavigate} hideBottomNav={showGlobalNav} />;
      case "driver-hub":
        return <MobileAppScreen onNavigate={handleNavigate} />;
      case "driver-earnings":
        return <ProductOrderCard onNavigate={handleNavigate} />;
      case "restaurant-dashboard":
        return <DataTableHeader onNavigate={handleNavigate} />;
      case "account":
        return <AccountScreen onNavigate={handleNavigate} />;
      case "partner-login":
        return (
          <LoginScreen
            initialRole={ctx.partnerLoginRole ?? "restaurant"}
            onBack={() => handleNavigate("role-select")}
            onSignIn={(data) => {
              const role = data?.role as "driver" | "restaurant";
              handleNavigate(role === "driver" ? "driver-hub" : "restaurant-dashboard");
            }}
            onForgotPassword={() => handleNavigate("forgot-password")}
            onSignUp={() => handleNavigate("sign-up")}
            onSocialLogin={(platform) => {
              handleNavigate(platform === "google" || platform === "facebook" ? "driver-hub" : "partner-login");
            }}
          />
        );
      case "personal-info":
      case "saved-addresses":
      case "payment-methods":
      case "favorites":
      case "help-support":
      case "location-picker":
      case "forgot-password":
      case "sign-up":
      case "order-detail":
      case "item-detail":
      case "support":
      case "notifications":
      case "edit-address":
      case "edit-phone":
      case "payout-settings":
      case "trip-history":
        return (
          <CursorPlaceholder
            screenId={screen}
            title={SCREENS.find((s) => s.id === screen)?.label.replace(" (CURSOR)", "") ?? screen}
            onBack={goBack}
            onNavigate={handleNavigate}
            onRestaurantSelect={handleRestaurantSelect}
          />
        );
      default:
        return <RoleSelectScreen onNavigate={handleNavigate} />;
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
      <div className="relative rounded-2xl shadow-2xl border-4 border-gray-300 overflow-hidden bg-gray-100 flex flex-col" style={{ width: 375, maxHeight: "90vh" }}>
        <div className="flex-1 overflow-y-auto overscroll-contain w-[375px] min-h-[400px]">
          {renderScreen()}
        </div>
        {showGlobalNav && (
          <MobileBottomNav currentScreen={screen} onNavigate={handleNavigate} />
        )}
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Click through the app or use the screen switcher to jump between flows
      </p>

      {/* Google Map modal - full viewport for mobile/Android */}
      <MapPicker
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onLocationSelect={(loc) => {
          setDeliveryLocation(loc);
          setMapOpen(false);
        }}
      />
    </div>
  );
}

export default function MobilePreviewPage() {
  return (
    <MobileRestaurantsProvider>
      <MobilePreviewProvider>
        <div className="mobile-preview-root min-h-screen bg-neutral-200">
          <MobilePreviewContent />
        </div>
      </MobilePreviewProvider>
    </MobileRestaurantsProvider>
  );
}
