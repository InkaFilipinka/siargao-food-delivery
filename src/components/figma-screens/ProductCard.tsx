import React, { useState } from 'react';
interface ProductCardProps {
  className?: string;
  style?: React.CSSProperties;
  onNavigate?: (screen: string) => void;
}
const COLORS = {
  primary: 'rgba(13, 148, 136, 1)',
  primaryHover: 'rgba(11, 128, 118, 1)',
  bg: 'rgba(250, 250, 249, 1)',
  white: 'rgba(255, 255, 255, 1)',
  gray50: 'rgba(249, 250, 251, 1)',
  gray100: 'rgba(243, 244, 246, 1)',
  gray200: 'rgba(229, 231, 235, 1)',
  gray400: 'rgba(156, 163, 175, 1)',
  gray500: 'rgba(107, 114, 128, 1)',
  gray600: 'rgba(75, 85, 99, 1)',
  gray900: 'rgba(17, 24, 39, 1)',
  orange: 'rgba(249, 115, 22, 1)',
  shadow: 'rgba(0, 0, 0, 0.1)'
};
export const ProductCard: React.FC<ProductCardProps> = ({
  className,
  style,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'Menu' | 'Info'>('Menu');
  const [activeCategory, setActiveCategory] = useState('Popular');
  const categories = ['Popular', 'Seafood', 'Grilled', 'Soups', 'Rice'];
  const menuItems = [{
    id: 1,
    name: 'Grilled Lapu-Lapu',
    description: 'Fresh grouper grilled with island spices, served with garlic rice',
    price: '₱450',
    rating: '4.9',
    image: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1739ffd6-cc6f-4499-b5d5-664ca73c2994.png'
  }, {
    id: 2,
    name: 'Seafood Kare-Kare',
    description: 'Traditional peanut stew with fresh prawns and vegetables',
    price: '₱380',
    rating: '4.7',
    image: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/37b2b7dd-5f3d-4664-ae3f-f8ff5ae23a64.png'
  }, {
    id: 3,
    name: 'Island Sisig',
    description: 'Sizzling pork sisig with coconut and local spices',
    price: '₱290',
    rating: '4.8',
    image: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3a08eb1c-4c5a-4985-a4dc-590914e00efa.png'
  }, {
    id: 4,
    name: 'Coconut Adobo',
    description: 'Classic adobo with coconut milk and island herbs',
    price: '₱320',
    rating: '4.6',
    image: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/846624ab-bec0-4893-b8a3-4c5e27ef0513.png'
  }, {
    id: 5,
    name: 'Fresh Mango Shake',
    description: 'Creamy mango shake made with local Siargao mangoes',
    price: '₱120',
    rating: '4.9',
    image: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/77edd41f-fa37-4ee1-9602-8891931cca21.png'
  }] as any[];
  const handleAction = (action: string) => {
    if (onNavigate) {
      const map: Record<string, string> = { back: 'home', 'view-cart': 'cart', 'nav-home': 'home', 'nav-orders': 'orders', 'nav-account': 'home' };
      if (map[action]) onNavigate(map[action]!);
      return;
    }
    console.log(`Action triggered: ${action}`);
  };
  return <div className={className} style={{
    width: '100%',
    maxWidth: '375px',
    height: '840px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray200,
    borderStyle: 'solid',
    borderWidth: '2px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif',
    margin: '0 auto',
    ...style
  }}>
      <div style={{
      flex: 1,
      backgroundColor: COLORS.bg,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '160px'
    }}>
        {/* Header */}
        <header style={{
        backgroundColor: COLORS.white,
        padding: '48px 16px 12px 16px',
        borderBottom: `1px solid ${COLORS.gray200}`,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
            <button onClick={() => handleAction('back')} style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: COLORS.gray100,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/5a120a4b-0977-4e24-a4fe-5f607da31b86.svg" alt="back" style={{
              width: '14px'
            }} />
            </button>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6fd4bb14-78b9-4b4d-83fb-06074e6c4a9c.svg" alt="TravelGo" style={{
              width: '28px'
            }} />
              <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900
            }}>TravelGo</span>
            </div>
            <button onClick={() => handleAction('search')} style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: COLORS.gray100,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/00e1a14b-989e-4ed7-90d4-18a7de83e525.svg" alt="search" style={{
              width: '16px'
            }} />
            </button>
          </div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: COLORS.gray600
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/a4555332-5381-42e3-9f2c-34227c9cd2de.svg" alt="delivery" style={{
            width: '10px'
          }} />
            <span>25-35 min</span>
            <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: COLORS.gray200
          }} />
            <span>₱35 delivery</span>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{
        position: 'relative',
        height: '192px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c9dbe328-2c51-47f3-a1b8-06697a743cd5.png" alt="Siargao Seafood House" style={{
          width: '100%',
          height: '375px',
          objectFit: 'cover',
          position: 'absolute',
          top: 0
        }} />
          <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '192px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.00) 100%)'
        }} />
          <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: COLORS.orange,
          padding: '5px 12px',
          borderRadius: '9999px'
        }}>
            <span style={{
            color: COLORS.white,
            fontSize: '14px',
            fontWeight: 600
          }}>20% OFF</span>
          </div>
          <div style={{
          position: 'absolute',
          bottom: '-104px',
          left: 0,
          right: 0,
          padding: '16px'
        }}>
            <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: COLORS.white,
            margin: '0 0 4px 0'
          }}>Siargao Seafood House</h1>
            <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 8px 0'
          }}>Fresh seafood • Filipino cuisine</p>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: COLORS.white,
            fontSize: '16px'
          }}>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/39b8a2df-1f30-40f1-84fc-da2af640d764.svg" alt="rating" style={{
                width: '18px'
              }} />
                <span style={{
                fontWeight: 500
              }}>4.8</span>
                <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px'
              }}>(1.2k+ ratings)</span>
              </div>
              <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)'
            }} />
              <span style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px'
            }}>Open until 11:00 PM</span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section style={{
        marginTop: '140px',
        backgroundColor: COLORS.white,
        display: 'flex',
        borderBottom: `1px solid ${COLORS.gray200}`
      }}>
          {(['Menu', 'Info'] as const).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1,
          padding: '13px 0',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          color: activeTab === tab ? COLORS.primary : COLORS.gray500,
          borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : '2px solid transparent',
          transition: 'all 0.2s'
        }}>
              {tab}
            </button>)}
        </section>

        {/* Category Filters */}
        <section style={{
        backgroundColor: COLORS.white,
        padding: '16px',
        borderBottom: `1px solid ${COLORS.gray100}`,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>
          <div style={{
          display: 'flex',
          gap: '12px'
        }}>
            {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '9px 16px',
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: activeCategory === cat ? COLORS.primary : COLORS.gray100,
            color: activeCategory === cat ? COLORS.white : COLORS.gray600,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
                {cat}
              </button>)}
          </div>
        </section>

        {/* Menu Items */}
        <section style={{
        padding: '16px'
      }}>
          <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: COLORS.gray900,
          marginBottom: '16px'
        }}>Popular Items</h3>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
            {menuItems.map(item => <div key={item.id} style={{
            display: 'flex',
            padding: '16px',
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            border: `1px solid ${COLORS.gray100}`,
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }} onClick={() => handleAction(`view-${item.id}`)}>
                <img src={item.image} alt={item.name} style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover'
            }} />
                <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
                  <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                    <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: COLORS.gray900,
                  margin: '0 0 4px 0'
                }}>{item.name}</h4>
                  </div>
                  <p style={{
                fontSize: '14px',
                color: COLORS.gray600,
                margin: '0 0 12px 0',
                lineHeight: '20px'
              }}>{item.description}</p>
                  <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto'
              }}>
                    <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                      <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: COLORS.gray900
                  }}>{item.price}</span>
                      <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                        <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/fc4a6ee9-481d-4d24-ae33-faf30c5fda6b.svg" alt="star" style={{
                      width: '13px'
                    }} />
                        <span style={{
                      fontSize: '12px',
                      color: COLORS.gray600
                    }}>{item.rating}</span>
                      </div>
                    </div>
                    <button onClick={e => {
                  e.stopPropagation();
                  handleAction(`add-${item.id}`);
                }} style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: COLORS.primary,
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.primaryHover} onMouseLeave={e => e.currentTarget.style.backgroundColor = COLORS.primary}>
                      <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/553a7db0-8441-48a7-9fb0-943b4178bad8.svg" alt="add" style={{
                    width: '12px'
                  }} />
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </section>
      </div>

      {/* Floating Cart Bar */}
      <div style={{
      position: 'absolute',
      bottom: '90px',
      left: '16px',
      right: '16px',
      backgroundColor: COLORS.primary,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      zIndex: 20
    }} onClick={() => handleAction('view-cart')}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
          <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            <span style={{
            color: COLORS.white,
            fontWeight: 700,
            fontSize: '14px'
          }}>2</span>
          </div>
          <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
            <span style={{
            color: COLORS.white,
            fontSize: '16px',
            fontWeight: 500
          }}>View Cart</span>
            <span style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>₱770</span>
          </div>
        </div>
        <button onClick={e => {
        e.stopPropagation();
        handleAction('checkout');
      }} style={{
        backgroundColor: COLORS.white,
        color: COLORS.primary,
        border: 'none',
        borderRadius: '8px',
        padding: '9px 16px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer'
      }}>
          Checkout
        </button>
      </div>

      {/* Navigation Footer */}
      <nav style={{
      height: '81px',
      backgroundColor: COLORS.white,
      borderTop: `1px solid ${COLORS.gray200}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: '8px',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }}>
        <button onClick={() => handleAction('nav-home')} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        border: 'none',
        background: 'none',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/066352df-13ab-4593-bc19-f9c3041ee826.svg" alt="home" style={{
          height: '18px'
        }} />
          <span style={{
          fontSize: '12px',
          color: COLORS.gray400,
          fontWeight: 500
        }}>Home</span>
        </button>
        <button onClick={() => handleAction('nav-orders')} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        border: 'none',
        background: 'none',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d10e471b-de18-430d-adb9-2e2d4aff9342.svg" alt="orders" style={{
          height: '18px'
        }} />
          <span style={{
          fontSize: '12px',
          color: COLORS.gray400,
          fontWeight: 500
        }}>Orders</span>
        </button>
        <button onClick={() => handleAction('nav-account')} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        border: 'none',
        background: 'none',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/029945a1-42a4-40ee-9c23-b0f6e0b21fa1.svg" alt="account" style={{
          height: '18px'
        }} />
          <span style={{
          fontSize: '12px',
          color: COLORS.gray400,
          fontWeight: 500
        }}>Account</span>
        </button>
      </nav>
    </div>;
};
