import React, { useState } from 'react';
interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
const NewBadge = ({
  style
}: {
  style?: React.CSSProperties;
}) => <span style={{
  width: '28px',
  height: '16px',
  color: 'rgba(255, 255, 255, 1)',
  boxSizing: 'content-box',
  fontSize: '12px',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 700,
  lineHeight: '16px',
  letterSpacing: '-0.5px',
  textAlign: 'left',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(74, 155, 142, 1)',
  borderRadius: '4px',
  ...style
}}>
    NEW
  </span>;
const WarningCircle = ({
  style
}: {
  style?: React.CSSProperties;
}) => <div style={{
  width: '24px',
  height: '24px',
  backgroundColor: 'rgba(251, 191, 36, 1)',
  borderColor: 'rgba(229, 231, 235, 1)',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  opacity: 0.2,
  borderRadius: '9999px',
  ...style
}} />;
interface DataTableHeaderProps {
  onNavigate?: (screen: string) => void;
}
export const DataTableHeader = ({ onNavigate }: DataTableHeaderProps) => {
  const [activeTab, setActiveTab] = useState('New');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const tabs = [{
    id: 'New',
    label: 'New',
    count: '3'
  }, {
    id: 'Preparing',
    label: 'Preparing (2)',
    count: null
  }, {
    id: 'Ready',
    label: 'Ready (1)',
    count: null
  }, {
    id: 'Completed',
    label: 'Completed',
    count: null
  }] as any[];
  const handleTabClick = (id: string) => {
    setActiveTab(id);
  };
  const getTabStyle = (id: string) => {
    const isActive = activeTab === id;
    if (isActive) {
      return {
        background: 'linear-gradient(180deg, rgba(74, 155, 142, 1.00) 0%, rgba(61, 132, 120, 1.00) 100%)',
        color: 'white',
        boxShadow: '1px 3px 6px rgba(74, 155, 142, 0.3), 0px 1px 0px rgba(255, 255, 255, 0.3)'
      };
    }
    return {
      background: 'linear-gradient(180deg, rgba(232, 220, 200, 1.00) 0%, rgba(212, 196, 176, 1.00) 100%)',
      color: 'rgba(68, 64, 60, 1)',
      boxShadow: '1px 2px 4px rgba(139, 115, 85, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.5)'
    };
  };
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    minHeight: '100vh',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(206, 212, 218, 1)',
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
      height: '70px',
      background: 'linear-gradient(180deg, rgba(139, 115, 85, 1.00) 0%, rgba(109, 90, 69, 1.00) 100%)',
      boxShadow: '0px 2px 8px rgba(69, 55, 40, 0.3)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      justifyContent: 'space-between',
      zIndex: 10,
      flexShrink: 0
    }}>
        <button onClick={() => onNavigate?.('partner-login')} style={{
        width: '44px',
        height: '44px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/4e0c78e1-0efd-4553-a58f-965ec5c1f6e4.svg" alt="Back" />
        </button>
        <div style={{
        textAlign: 'center'
      }}>
          <div style={{
          color: 'white',
          fontSize: '20px',
          fontFamily: '"Crimson Pro", serif'
        }}>Island Grill</div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/f2cea64c-9ba7-4042-9dd7-984ef888cb76.svg" alt="Star" />
            <span style={{
            color: 'rgba(254, 249, 195, 1)',
            fontSize: '12px',
            fontWeight: 500
          }}>4.8</span>
          </div>
        </div>
        <button style={{
        width: '44px',
        height: '44px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/04d152ae-096d-4641-9578-b127fd2cf3c9.svg" alt="Search" />
        </button>
      </header>

      {/* Tabs */}
      <section style={{
      padding: '16px',
      overflowX: 'auto',
      flexShrink: 0
    }}>
        <div style={{
        display: 'flex',
        gap: '8px',
        minWidth: 'max-content'
      }}>
          {tabs.map(tab => <button key={tab.id} onClick={() => handleTabClick(tab.id)} style={{
          height: '40px',
          padding: '0 20px',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          ...getTabStyle(tab.id)
        }}>
              <span>{tab.label}</span>
              {tab.count && <span style={{
            fontSize: '12px',
            fontWeight: 700
          }}>{tab.count}</span>}
            </button>)}
        </div>
      </section>

      {/* Content Body */}
      <main style={{
      flex: 1,
      padding: '0 16px 100px 16px',
      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 14%, rgba(0, 0, 0, 0.02) 100%)',
      overflowY: 'auto'
    }}>
        {/* Order Card 1 */}
        <article style={{
        width: '100%',
        background: 'linear-gradient(180deg, rgba(255, 251, 245, 1.00) 0%, rgba(249, 244, 236, 1.00) 100%)',
        borderRadius: '16px',
        boxShadow: '2px 4px 8px rgba(139, 115, 85, 0.15), 0px 1px 0px rgba(255, 255, 255, 0.8)',
        padding: '16px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
            <div>
              <div style={{
              fontSize: '24px',
              fontFamily: '"Crimson Pro", serif',
              color: 'rgba(41, 37, 36, 1)'
            }}>#2847</div>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/4ea901ef-0ace-4325-a241-15cf9b8b6104.svg" alt="Clock" style={{
                width: '12px'
              }} />
                <span style={{
                fontSize: '12px',
                color: 'rgba(146, 64, 14, 1)',
                fontWeight: 500
              }}>12:34 PM</span>
                <NewBadge style={{
                marginLeft: '4px'
              }} />
              </div>
            </div>
            <button style={{
            width: '40px',
            height: '40px',
            background: 'rgba(139, 115, 85, 0.1)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c809fdf9-83fa-4bba-98fa-e63f595907c6.svg" alt="More" />
            </button>
          </div>

          <div style={{
          marginBottom: '16px'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
              <div>
                <div style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'rgba(68, 64, 60, 1)'
              }}>2x Jerk Chicken Platter</div>
                <div style={{
                fontSize: '14px',
                color: 'rgba(120, 113, 108, 1)'
              }}>w/ Rice & Peas</div>
              </div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(68, 64, 60, 1)'
            }}>$34.98</div>
            </div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
              <div>
                <div style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'rgba(68, 64, 60, 1)'
              }}>1x Coconut Shrimp</div>
                <div style={{
                fontSize: '14px',
                color: 'rgba(120, 113, 108, 1)'
              }}>Extra Sauce</div>
              </div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(68, 64, 60, 1)'
            }}>$18.99</div>
            </div>
          </div>

          <div style={{
          background: 'linear-gradient(180deg, rgba(255, 249, 230, 1.00) 0%, rgba(255, 244, 214, 1.00) 100%)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '2px 3px 6px rgba(139, 115, 85, 0.2)'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/80451b2e-6889-4b06-b680-90da7c34a616.svg" alt="Note" style={{
            width: '12px'
          }} />
            <span style={{
            fontSize: '14px',
            color: 'rgba(68, 64, 60, 1)',
            fontStyle: 'italic'
          }}>"Extra spicy please! No onions on the chicken."</span>
          </div>

          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(231, 229, 228, 1)',
          paddingTop: '12px',
          marginBottom: '16px'
        }}>
            <div>
              <div style={{
              fontSize: '12px',
              color: 'rgba(120, 113, 108, 1)',
              fontWeight: 500
            }}>Customer</div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(41, 37, 36, 1)'
            }}>Sarah M.</div>
            </div>
            <div style={{
            textAlign: 'right'
          }}>
              <div style={{
              fontSize: '12px',
              color: 'rgba(120, 113, 108, 1)',
              fontWeight: 500
            }}>Total</div>
              <div style={{
              fontSize: '20px',
              fontFamily: '"Crimson Pro", serif',
              color: 'rgba(41, 37, 36, 1)'
            }}>$53.97</div>
            </div>
          </div>

          <div style={{
          display: 'flex',
          gap: '8px'
        }}>
            <button onMouseEnter={() => setHoveredButton('reject-1')} onMouseLeave={() => setHoveredButton(null)} style={{
            flex: 1,
            height: '48px',
            background: 'linear-gradient(180deg, rgba(196, 160, 122, 1.00) 0%, rgba(176, 139, 100, 1.00) 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0px 3px 6px rgba(196, 160, 122, 0.3), 0px 1px 0px rgba(255, 255, 255, 0.3)',
            opacity: hoveredButton === 'reject-1' ? 0.9 : 1,
            transition: 'opacity 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3d74ccfc-822f-427d-9305-daacac3cd1ab.svg" alt="Reject" />
              <span style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '16px'
            }}>Reject</span>
            </button>
            <button onMouseEnter={() => setHoveredButton('accept-1')} onMouseLeave={() => setHoveredButton(null)} style={{
            flex: 1,
            height: '48px',
            background: 'linear-gradient(180deg, rgba(74, 155, 142, 1.00) 0%, rgba(61, 132, 120, 1.00) 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0px 3px 6px rgba(74, 155, 142, 0.3), 0px 1px 0px rgba(255, 255, 255, 0.3)',
            opacity: hoveredButton === 'accept-1' ? 0.9 : 1,
            transition: 'opacity 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1b8995dc-3989-424e-97ee-ca1afce40df9.svg" alt="Accept" />
              <span style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '16px'
            }}>Accept</span>
            </button>
          </div>
        </article>

        {/* Order Card 2 (Simplified repetition of Card 1 structure for fidelity) */}
        <article style={{
        width: '100%',
        background: 'linear-gradient(180deg, rgba(255, 251, 245, 1.00) 0%, rgba(249, 244, 236, 1.00) 100%)',
        borderRadius: '16px',
        boxShadow: '2px 4px 8px rgba(139, 115, 85, 0.15), 0px 1px 0px rgba(255, 255, 255, 0.8)',
        padding: '16px',
        marginBottom: '16px',
        boxSizing: 'border-box'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
            <div>
              <div style={{
              fontSize: '24px',
              fontFamily: '"Crimson Pro", serif',
              color: 'rgba(41, 37, 36, 1)'
            }}>#2846</div>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ad06e70a-b2ee-4b3d-a3d9-2a1eb0dd59f5.svg" alt="Clock" style={{
                width: '12px'
              }} />
                <span style={{
                fontSize: '12px',
                color: 'rgba(146, 64, 14, 1)',
                fontWeight: 500
              }}>12:28 PM</span>
                <NewBadge style={{
                marginLeft: '4px'
              }} />
              </div>
            </div>
            <button style={{
            width: '40px',
            height: '40px',
            background: 'rgba(139, 115, 85, 0.1)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/df401719-bfab-4e3c-9638-35c61be0a510.svg" alt="More" />
            </button>
          </div>
          <div style={{
          marginBottom: '16px'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
              <div>
                <div style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'rgba(68, 64, 60, 1)'
              }}>1x Grilled Mahi-Mahi</div>
                <div style={{
                fontSize: '14px',
                color: 'rgba(120, 113, 108, 1)'
              }}>w/ Plantains</div>
              </div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(68, 64, 60, 1)'
            }}>$24.99</div>
            </div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
              <div>
                <div style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'rgba(68, 64, 60, 1)'
              }}>1x Tropical Salad</div>
              </div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(68, 64, 60, 1)'
            }}>$12.99</div>
            </div>
          </div>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(231, 229, 228, 1)',
          paddingTop: '12px',
          marginBottom: '16px'
        }}>
            <div>
              <div style={{
              fontSize: '12px',
              color: 'rgba(120, 113, 108, 1)',
              fontWeight: 500
            }}>Customer</div>
              <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(41, 37, 36, 1)'
            }}>Marcus T.</div>
            </div>
            <div style={{
            textAlign: 'right'
          }}>
              <div style={{
              fontSize: '12px',
              color: 'rgba(120, 113, 108, 1)',
              fontWeight: 500
            }}>Total</div>
              <div style={{
              fontSize: '20px',
              fontFamily: '"Crimson Pro", serif',
              color: 'rgba(41, 37, 36, 1)'
            }}>$53.96</div>
            </div>
          </div>
          <div style={{
          display: 'flex',
          gap: '8px'
        }}>
            <button onMouseEnter={() => setHoveredButton('reject-2')} onMouseLeave={() => setHoveredButton(null)} style={{
            flex: 1,
            height: '48px',
            background: 'linear-gradient(180deg, rgba(196, 160, 122, 1.00) 0%, rgba(176, 139, 100, 1.00) 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0px 3px 6px rgba(196, 160, 122, 0.3), 0px 1px 0px rgba(255, 255, 255, 0.3)',
            opacity: hoveredButton === 'reject-2' ? 0.9 : 1,
            transition: 'opacity 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/0858a3a9-f32a-47e0-8b17-5ed8c7eb6c92.svg" alt="Reject" />
              <span style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '16px'
            }}>Reject</span>
            </button>
            <button onMouseEnter={() => setHoveredButton('accept-2')} onMouseLeave={() => setHoveredButton(null)} style={{
            flex: 1,
            height: '48px',
            background: 'linear-gradient(180deg, rgba(74, 155, 142, 1.00) 0%, rgba(61, 132, 120, 1.00) 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0px 3px 6px rgba(74, 155, 142, 0.3), 0px 1px 0px rgba(255, 255, 255, 0.3)',
            opacity: hoveredButton === 'accept-2' ? 0.9 : 1,
            transition: 'opacity 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/57056ca6-5caa-42cd-abcb-a08e56f10754.svg" alt="Accept" />
              <span style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '16px'
            }}>Accept</span>
            </button>
          </div>
        </article>
      </main>

      {/* Footer Nav */}
      <footer style={{
      width: '100%',
      maxWidth: '375px',
      height: '80px',
      background: 'linear-gradient(180deg, rgba(139, 115, 85, 1.00) 0%, rgba(109, 90, 69, 1.00) 100%)',
      boxShadow: '0px -2px 8px rgba(69, 55, 40, 0.3)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20
    }}>
        <button style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/172b82a6-3a8a-4de9-86da-aede2bac16ea.svg" alt="Analytics" />
          <span style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 500
        }}>Analytics</span>
        </button>
        <button style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        position: 'relative'
      }}>
          <div style={{
          width: '48px',
          height: '4px',
          backgroundColor: 'rgba(45, 212, 191, 1)',
          borderRadius: '9999px',
          position: 'absolute',
          top: '-16px'
        }} />
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d7b6d159-e893-4c0b-981b-ec5a6a7041d2.svg" alt="Orders" />
          <span style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 500
        }}>Orders</span>
        </button>
        <button style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ab7adbf7-c434-4069-980d-a15d1c90c263.svg" alt="Menu" />
          <span style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 500
        }}>Menu</span>
        </button>
        <button style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/70d4771f-6369-4a49-8586-5006926f30c2.svg" alt="Settings" />
          <span style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 500
        }}>Settings</span>
        </button>
      </footer>
    </div>;
};
