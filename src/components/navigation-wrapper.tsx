"use client";

import { useState } from "react";
import { Navigation } from "./navigation";
import { CartDrawer } from "./cart-drawer";

export function NavigationWrapper() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navigation onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
