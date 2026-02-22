import React, { useState, useMemo } from "react";
import type { DeliveryLocation } from "@/contexts/mobile-preview-context";
import { useMobileRestaurants } from "@/contexts/mobile-restaurants-context";
import { useFavoritesStore } from "@/store/favorites-store";
import { useCartStore } from "@/store/cart-store";
import { thumbnailUrl } from "@/lib/image-url";

interface FoodSearchScreenProps {
  onNavigate?: (screen: string) => void;
  onRestaurantSelect?: (slug: string) => void;
  hideBottomNav?: boolean;
  onOpenMap?: () => void;
  deliveryLocation?: DeliveryLocation | null;
}

const CATEGORY_ICON = "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/772d3d76-d01c-473d-8cfb-8859218f92ac.svg";

export const FoodSearchScreen = ({ onNavigate, onRestaurantSelect, hideBottomNav, onOpenMap, deliveryLocation }: FoodSearchScreenProps) => {
  const locationLabel = deliveryLocation?.placeName
    ? deliveryLocation.placeName.split(" - ")[0] || deliveryLocation.placeName
    : deliveryLocation
      ? `${deliveryLocation.distance}km from General Luna`
      : "General Luna, Siargao";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Home");
  const { restaurants, categories: apiCategories, ratings, loading } = useMobileRestaurants() ?? { restaurants: [], categories: ["All"], ratings: {}, loading: true };
  const { isFavorite, toggleRestaurant } = useFavoritesStore();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const categories = useMemo(() => ["All", ...(apiCategories || []).filter((c) => c !== "All")], [apiCategories]);

  const filteredRestaurants = useMemo(() => {
    let list = activeCategory === "All" ? restaurants : restaurants.filter((r) => r.categories?.includes(activeCategory));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.categories?.some((c) => c.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.menuItems?.some((m) => m.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [restaurants, activeCategory, searchQuery]);
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    height: '840px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
    borderColor: '#CED4DA',
    borderStyle: 'solid',
    borderWidth: '2px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif'
  }}>
      {/* Header */}
      <header style={{
      width: '100%',
      height: '128px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      position: 'absolute',
      top: 0,
      zIndex: 10
    }}>
        {/* Logo Section */}
        <div style={{
        position: 'absolute',
        left: '125.69px',
        top: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/22d6a063-0a6a-4226-b34f-6dbad2866c48.svg" alt="TravelGo" style={{
          width: '28px',
          height: '28px'
        }} />
          <span style={{
          color: '#111827',
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: '28px',
          letterSpacing: '-0.5px'
        }}>TravelGo</span>
        </div>

        {/* Location & Profile Section */}
        <div style={{
        position: 'absolute',
        left: '16px',
        top: '72px',
        width: '343px',
        height: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <button
            onClick={() => onOpenMap?.()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              padding: 0,
              cursor: onOpenMap ? "pointer" : "default",
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <div style={{
            width: "24px",
            height: "24px",
            backgroundColor: "#0D9488",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1f2b6359-dac7-4263-8b0a-a46445db8333.svg" alt="loc" style={{ width: "9px", height: "12px" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#6B7280", fontSize: "12px", lineHeight: "16px" }}>Deliver to</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#111827", fontSize: "14px", fontWeight: 600 }}>{locationLabel}</span>
                {onOpenMap && (
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8b9ab84d-5acb-4fe7-aef7-5422285738b6.svg" alt="arrow" style={{ width: "12px", height: "12px" }} />
                )}
              </div>
            </div>
          </button>
          <div style={{
          display: 'flex',
          gap: '12px'
        }}>
            <button onClick={() => onNavigate?.('cart')} style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#F3F4F6',
            border: 'none',
            borderRadius: '50%',
            position: 'relative',
            cursor: 'pointer'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/166c1b62-1a3e-4bcb-9c66-ea53dead3040.svg" alt="cart" style={{
              width: '14px',
              height: '16px'
            }} />
              <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              backgroundColor: '#F97316',
              borderRadius: '50%',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid white'
            }}>{cartCount || 0}</div>
            </button>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ca7877fc-1add-482d-a82d-355f88d9cc80.jpg" alt="Profile" onClick={() => onNavigate?.('account')} role="button" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #0D9488',
            cursor: 'pointer',
            objectFit: 'cover'
          }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
      marginTop: '128px',
      height: '641px',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
        {/* Search Bar */}
        <section style={{
        padding: '0 16px',
        height: '64px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center'
      }}>
          <div style={{
          position: 'relative',
          width: '100%'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/30aed75e-3456-4a56-a5ce-af3165fc6a22.svg" alt="search" style={{
            position: 'absolute',
            left: '16px',
            top: '16px',
            width: '16px',
            height: '16px',
            zIndex: 1
          }} />
            <input type="text" placeholder="Search restaurants, dishes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{
            width: '100%',
            height: '48px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            paddingLeft: '48px',
            fontSize: '16px',
            color: '#111827',
            outline: 'none',
            boxSizing: 'border-box'
          }} />
          </div>
        </section>

        {/* Categories Scroller */}
        <section style={{
        height: '69px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        paddingLeft: '16px',
        scrollbarWidth: 'none'
      }}>
          <div style={{
          display: 'flex',
          gap: '12px',
          paddingRight: '16px'
        }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                height: "36px",
                minWidth: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: activeCategory === cat ? "#0D9488" : "#F3F4F6",
                border: "none",
                borderRadius: "9999px",
                padding: "0 16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                <img src={CATEGORY_ICON} alt="" style={{
                  width: "12px",
                  height: "12px",
                  filter: activeCategory === cat ? "brightness(0) invert(1)" : "none",
                }} />
                <span style={{
                  color: activeCategory === cat ? "#FFFFFF" : "#374151",
                  fontSize: "14px",
                  fontWeight: 500,
                }}>{cat}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Restaurant List */}
        <section style={{
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6B7280", fontSize: 14 }}>Loading restaurants...</div>
          ) : filteredRestaurants.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6B7280", fontSize: 14 }}>No restaurants found</div>
          ) : (
            filteredRestaurants.map((res) => {
              const rating = ratings[res.slug];
              const resImage = res.featuredImage || res.imageUrls?.[0];
              const tags = (res.tags || []).slice(0, 2).join(" • ") || res.categories?.slice(0, 2).join(" • ") || "";
              const minOrder = res.minOrderPhp != null ? `Min ₱${res.minOrderPhp}` : "";
              return (
                <div
                  key={res.slug}
                  onClick={() => onRestaurantSelect?.(res.slug)}
                  style={{
                    width: "343px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #F3F4F6",
                    borderRadius: "12px",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ height: "128px", position: "relative", backgroundColor: "#E5E7EB" }}>
                    {resImage ? (
                      <img
                        src={resImage.startsWith("/api/image") ? thumbnailUrl(resImage, 480) : resImage}
                        alt={res.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRestaurant(res.slug);
                      }}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        width: "32px",
                        height: "32px",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c0862690-99ad-48e6-933b-6d1307c0c3dd.svg"
                        alt="fav"
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: isFavorite(res.slug) ? "invert(27%) sepia(91%) saturate(2352%) hue-rotate(346deg) brightness(104%) contrast(101%)" : "none",
                        }}
                      />
                    </button>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>{res.name}</h3>
                      {rating && rating.count > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1640b383-a00a-4cdf-bc99-6f9c5ee000a0.svg" alt="star" style={{ width: "15.75px", height: "14px" }} />
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{rating.avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4B6663" }}>{tags}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/a729998a-cdae-4d45-89e1-dd42770398d8.svg" alt="time" style={{ width: "12px", height: "12px" }} />
                          <span style={{ fontSize: "14px", color: "#4B5563" }}>25-35 min</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6c741ace-d36f-405c-bb37-b6dc897cdc52.svg" alt="delivery" style={{ width: "15px", height: "12px" }} />
                          <span style={{ fontSize: "14px", color: "#4B5563" }}>₱35</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{minOrder}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Navigation Bar */}
      {!hideBottomNav && <nav style={{
      width: '100%',
      height: '71px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      position: 'absolute',
      bottom: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 16px',
      boxSizing: 'border-box',
      zIndex: 10
    }}>
        {[{
        name: 'Home',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/14649436-96e8-4ea7-865a-834a1f5b7f8b.svg'
      }, {
        name: 'Orders',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/80069351-0f00-442f-acab-1699edd85cf5.svg'
      }, {
        name: 'Account',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/7f941418-5915-40c6-8e55-62d6db52b58a.svg'
      }].map(tab => <button key={tab.name} onClick={() => onNavigate ? onNavigate(tab.name === 'Home' ? 'home' : tab.name === 'Orders' ? 'orders' : tab.name === 'Account' ? 'account' : 'home') : setActiveTab(tab.name)} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: '8px 0',
        width: '72px'
      }}>
            <img src={tab.icon} alt={tab.name} style={{
          width: '20px',
          height: '18px',
          filter: activeTab === tab.name ? 'invert(37%) sepia(85%) saturate(543%) hue-rotate(126deg) brightness(92%) contrast(92%)' : 'invert(75%) sepia(6%) saturate(695%) hue-rotate(182deg) brightness(91%) contrast(85%)'
        }} />
            <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: activeTab === tab.name ? '#0D9488' : '#9CA3AF'
        }}>{tab.name}</span>
          </button>)}
      </nav>}

      {/* Decorative Blur Elements */}
      <div style={{
      width: '32px',
      height: '32px',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderRadius: '50%',
      position: 'absolute',
      left: '327px',
      top: '96px',
      zIndex: 5,
      pointerEvents: 'none'
    }} />
      <div style={{
      width: '48px',
      height: '48px',
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      borderRadius: '50%',
      position: 'absolute',
      left: '8px',
      top: '400px',
      zIndex: 5,
      pointerEvents: 'none'
    }} />
    </div>;
};
