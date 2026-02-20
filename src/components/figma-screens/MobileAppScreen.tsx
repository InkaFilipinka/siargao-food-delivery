import React, { useState } from 'react';
interface MobileAppScreenProps {
  className?: string;
  style?: React.CSSProperties;
  onNavigate?: (screen: string) => void;
}
export const MobileAppScreen = ({
  className,
  style,
  onNavigate
}: MobileAppScreenProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const toggleOnline = () => setIsOnline(!isOnline);
  const buttonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '0.9';
    e.currentTarget.style.transform = 'scale(0.98)';
  };
  const buttonResetStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };
  return <div className={`mobile-app-screen ${className || ''}`.trim()} style={{
    width: '375px',
    height: '840px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFAF9',
    borderColor: '#CED4DA',
    borderStyle: 'solid',
    borderWidth: '2px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif',
    ...style
  }}>
      {/* HEADER SECTION */}
      <header style={{
      width: '100%',
      height: '152px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      zIndex: 10,
      flexShrink: 0
    }}>
        <div style={{
        padding: '48px 16px 0 16px'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '40px'
        }}>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8b6d2082-f5f8-473f-bfaf-c9cd46e1e17c.svg" alt="TravelGo Logo" style={{
              width: '28px',
              height: '28px'
            }} />
              <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>TravelGo</h1>
            </div>
            <button aria-label="Notifications" onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/287eca92-c9f7-4394-a112-9fda52fbdd61.svg" alt="Bell Icon" style={{
              width: '14px',
              height: '16px'
            }} />
            </button>
          </div>
          
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ad35d554-fdaf-4009-adbf-9f292d3f0777.jpg" alt="Carlos Rivera" style={{
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            objectFit: 'cover',
            border: '1px solid #E5E7EB'
          }} />
            <div>
              <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827'
            }}>Carlos Rivera</div>
              <div style={{
              fontSize: '12px',
              color: '#6B7280'
            }}>⭐ 4.9 • 342 deliveries</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA (SCROLLABLE) */}
      <main style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#FAFAF9',
      scrollbarWidth: 'none'
    }}>
        
        {/* ONLINE STATUS CARD */}
        <section style={{
        background: isOnline ? 'linear-gradient(180deg, #0D9488 0%, #0F766E 100%)' : '#4B5563',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
        color: '#FFFFFF'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
            <div>
              <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px'
            }}>
                {isOnline ? "You're Online" : "You're Offline"}
              </h2>
              <p style={{
              fontSize: '14px',
              color: '#CCFBF1',
              margin: 0,
              opacity: isOnline ? 1 : 0.7
            }}>
                {isOnline ? 'Ready to accept orders' : 'Tap to start working'}
              </p>
            </div>
            <button onClick={toggleOnline} style={{
            width: '64px',
            height: '36px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
              <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: isOnline ? '#0D9488' : '#9CA3AF',
              borderRadius: '9999px',
              position: 'absolute',
              left: isOnline ? '32px' : '4px',
              top: '3px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            </button>
          </div>
          
          <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px'
        }}>
            {[{
            val: '4',
            label: 'Today'
          }, {
            val: '₱840',
            label: 'Earnings'
          }, {
            val: '2.5h',
            label: 'Online'
          }].map((stat, idx) => <div key={idx} style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '10px 0',
            textAlign: 'center'
          }}>
                <div style={{
              fontSize: '20px',
              fontWeight: 700
            }}>{stat.val}</div>
                <div style={{
              fontSize: '12px',
              color: '#CCFBF1'
            }}>{stat.label}</div>
              </div>)}
          </div>
        </section>

        {/* ACTIVE DELIVERY CARD */}
        <section style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
          <header style={{
          background: '#F97316',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
            <div>
              <div style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#FFFFFF'
            }}>Active Delivery</div>
              <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF'
            }}>Order #2847</div>
            </div>
            <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFFFFF'
          }}>
              Picking Up
            </div>
          </header>
          
          <div style={{
          padding: '20px'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px'
          }}>
              <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#CCFBF1',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/7a9878f4-35e6-4c2f-9cc7-a211fc688411.svg" alt="Restaurant Icon" style={{
                width: '20px'
              }} />
              </div>
              <div style={{
              flex: 1
            }}>
                <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827'
              }}>Siargao Bowl Co.</div>
                <div style={{
                fontSize: '14px',
                color: '#4B5563'
              }}>Cloud 9, General Luna</div>
                <div style={{
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '4px'
              }}>Order ready for pickup</div>
              </div>
              <div style={{
              textAlign: 'right'
            }}>
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Distance</div>
                <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#111827'
              }}>2.3 km</div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{
            position: 'relative',
            paddingLeft: '28px'
          }}>
              <div style={{
              position: 'absolute',
              left: '4px',
              top: '4px',
              bottom: '4px',
              width: '2px',
              backgroundColor: '#E5E7EB'
            }} />
              <div style={{
              marginBottom: '24px',
              position: 'relative'
            }}>
                <div style={{
                position: 'absolute',
                left: '-28px',
                top: '4px',
                width: '12px',
                height: '12px',
                backgroundColor: '#0D9488',
                borderRadius: '50%',
                border: '1px solid #E5E7EB'
              }} />
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Pickup from</div>
                <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827'
              }}>Siargao Bowl Co.</div>
              </div>
              <div style={{
              position: 'relative'
            }}>
                <div style={{
                position: 'absolute',
                left: '-28px',
                top: '4px',
                width: '12px',
                height: '12px',
                backgroundColor: '#D1D5DB',
                borderRadius: '50%',
                border: '1px solid #E5E7EB'
              }} />
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Deliver to</div>
                <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827'
              }}>Maria Santos</div>
                <div style={{
                fontSize: '12px',
                color: '#4B5563'
              }}>Beachfront Resort, Tourism Rd</div>
              </div>
            </div>

            {/* Items Summary */}
            <div style={{
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px'
          }}>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
                <span style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Items</span>
                <span style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>₱485</span>
              </div>
              <div style={{
              fontSize: '14px',
              color: '#111827',
              marginBottom: '12px'
            }}>2x Acai Bowl, 1x Smoothie</div>
              <div style={{
              height: '1px',
              backgroundColor: '#E5E7EB',
              margin: '0 -4px 12px -4px'
            }} />
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
                <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827'
              }}>Your Earnings</span>
                <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0D9488'
              }}>₱85</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
            width: '100%',
            height: '52px',
            backgroundColor: '#0D9488',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            marginTop: '20px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'transform 0.1s ease'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/48ee9591-70a9-40df-8dd2-90658630e53a.svg" alt="Nav" style={{
              width: '14px'
            }} />
              Start Navigation
            </button>
            
            <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px'
          }}>
              <button onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
              flex: 1,
              height: '44px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/df294547-2e1d-4b13-82fd-5e91449962e1.svg" alt="Call" style={{
                width: '14px'
              }} />
                Call Restaurant
              </button>
              <button onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
              flex: 1,
              height: '44px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/99b39101-82b4-4c42-86a9-38ac54739e9a.svg" alt="Call" style={{
                width: '12px'
              }} />
                Call Customer
              </button>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 12px 0'
        }}>Quick Actions</h3>
          <div style={{
          display: 'flex',
          gap: '12px'
        }}>
            <button onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
            flex: 1,
            height: '108px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
              <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#DBEAFE',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/10eab87c-a537-4476-b25d-2c87a232a1fa.svg" alt="Fuel" style={{
                width: '18px'
              }} />
              </div>
              <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827'
            }}>Fuel Break</span>
            </button>
            <button onMouseEnter={buttonHoverStyle} onMouseLeave={buttonResetStyle} style={{
            flex: 1,
            height: '108px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
              <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#F3E8FF',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d02fb2ce-0d61-4247-8e01-577482727e56.svg" alt="Issue" style={{
                width: '18px'
              }} />
              </div>
              <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827'
            }}>Report Issue</span>
            </button>
          </div>
        </section>

        {/* TODAY'S SUMMARY */}
        <section style={{
        marginBottom: '16px'
      }}>
          <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 12px 0'
        }}>Today's Summary</h3>
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
              <div style={{
              textAlign: 'center'
            }}>
                <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#DCFCE7',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/25f33cf7-ee94-4f45-b6d4-6ebd636060d3.svg" alt="Check" style={{
                  width: '14px'
                }} />
                </div>
                <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827'
              }}>4</div>
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Completed</div>
              </div>
              <div style={{
              textAlign: 'center'
            }}>
                <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#CCFBF1',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/145595ce-5ba3-4de4-83f1-6729e857315a.svg" alt="Peso" style={{
                  width: '12px'
                }} />
                </div>
                <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827'
              }}>₱840</div>
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Earned</div>
              </div>
              <div style={{
              textAlign: 'center'
            }}>
                <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#FFEDD5',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c44533ec-bbdb-44c6-a266-c3a66b8919ac.svg" alt="Time" style={{
                  width: '16px'
                }} />
                </div>
                <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827'
              }}>2.5h</div>
                <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>Online</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* NAVIGATION BAR */}
      <nav style={{
      width: '100%',
      height: '81px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: '8px',
      flexShrink: 0
    }}>
        <button onClick={() => onNavigate?.('driver-hub')} style={{
        backgroundColor: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/2c7b8d04-33aa-40b4-923e-3303ffa12564.svg" alt="Hub" style={{
          width: '22px'
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#0D9488'
        }}>Driver Hub</span>
        </button>
        <button onClick={() => onNavigate?.('driver-earnings')} style={{
        backgroundColor: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8680b3e9-e72d-4975-8aad-e8c543289b11.svg" alt="Earnings" style={{
          width: '18px'
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#9CA3AF'
        }}>Earnings</span>
        </button>
      </nav>
    </div>;
};
