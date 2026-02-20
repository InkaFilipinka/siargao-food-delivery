import React, { useState } from 'react';
interface MobileOrderDetailsProps {
  onNavigate?: (screen: string) => void;
}
export const MobileOrderDetails = ({ onNavigate }: MobileOrderDetailsProps) => {
  const [activeTab, setActiveTab] = useState('orders');
  const handleBack = () => onNavigate ? onNavigate('orders') : console.log('Back clicked');
  const handleSupport = () => console.log('Support clicked');
  const handleCall = () => console.log('Calling rider...');
  const handleMessage = () => console.log('Opening chat...');
  const handleNavClick = (tab: string) => onNavigate ? onNavigate(tab === 'home' ? 'home' : tab === 'orders' ? 'orders' : 'home') : setActiveTab(tab);
  const buttonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '0.8';
    e.currentTarget.style.transform = 'scale(0.98)';
  };
  const buttonLeaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };
  return <div className="mobile-order-details-container" style={{
    width: '375px',
    height: '840px',
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
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif'
  }}>
      <div className="body" style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(250, 250, 249, 1)',
      position: 'relative'
    }}>
        {/* Header */}
        <header style={{
        width: '375px',
        height: '104px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderBottom: '1px solid rgba(229, 231, 235, 1)',
        boxSizing: 'border-box',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        left: '0px',
        top: '0px',
        zIndex: 10
      }}>
          <div style={{
          width: '343px',
          height: '40px',
          position: 'absolute',
          left: '16px',
          top: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
            <button onClick={handleBack} onMouseEnter={buttonHoverStyle} onMouseLeave={buttonLeaveStyle} style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(243, 244, 246, 1)',
            border: 'none',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/7a9a134e-e6af-4f7c-88d1-8df4cfc9992c.svg" alt="back" style={{
              width: '14px',
              height: '16px'
            }} />
            </button>
            
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/5f23bb0b-a806-4b0a-ae29-90e82203044d.svg" alt="logo" style={{
              width: '24px',
              height: '24px'
            }} />
              <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'rgba(17, 24, 39, 1)',
              letterSpacing: '-0.5px'
            }}>TravelGo</span>
            </div>

            <button onClick={handleSupport} onMouseEnter={buttonHoverStyle} onMouseLeave={buttonLeaveStyle} style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(243, 244, 246, 1)',
            border: 'none',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/035a5620-d4de-4743-8112-812cc8329c30.svg" alt="support" style={{
              width: '16px',
              height: '16px'
            }} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main style={{
        width: '375px',
        height: '655px',
        position: 'absolute',
        left: '0px',
        top: '104px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: '20px',
        scrollbarWidth: 'none'
      }}>
          {/* Order Status Timeline Section */}
          <section style={{
          width: '375px',
          height: '506px',
          position: 'relative'
        }}>
            <div style={{
            width: '343px',
            height: '458px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(243, 244, 246, 1)',
            borderRadius: '12px',
            position: 'absolute',
            left: '16px',
            top: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
              <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '17px'
            }}>
                <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: 'rgba(17, 24, 39, 1)',
                letterSpacing: '-0.5px'
              }}>Order #OD2024-001</h2>
                <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'rgba(75, 85, 99, 1)'
              }}>Estimated delivery: 15-20 mins</p>
              </div>

              <div style={{
              position: 'relative',
              marginLeft: '17px',
              marginTop: '34px',
              height: '356px'
            }}>
                {/* Timeline Line */}
                <div style={{
                width: '2px',
                height: '324px',
                backgroundColor: 'rgba(229, 231, 235, 1)',
                position: 'absolute',
                left: '24px',
                top: '32px',
                zIndex: 0
              }} />
                
                {/* Timeline Items */}
                {[{
                label: 'Order Confirmed',
                time: '2:15 PM',
                status: 'completed',
                icon: '976dfe42-2da1-4ec1-af0a-14b69254769b.svg'
              }, {
                label: 'Preparing Your Food',
                time: '2:18 PM',
                status: 'completed',
                icon: '3360b2b9-00c3-4fb4-9bdf-8a4fec135e28.svg'
              }, {
                label: 'Picked Up',
                time: '2:32 PM',
                status: 'completed',
                icon: 'c9b960ef-c8f1-4478-a6c8-6a079c566f7b.svg'
              }, {
                label: 'On the Way',
                time: 'Current status',
                status: 'active',
                icon: '97efde46-674b-4d5f-b56a-a5cecaeb3d7c.svg'
              }, {
                label: 'Delivered',
                time: 'Pending',
                status: 'pending',
                icon: '7974987b-db6f-4941-a354-ab25e044ca65.svg'
              }].map((step, idx) => <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1
              }}>
                    <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: step.status === 'active' ? 'rgba(249, 115, 22, 1)' : step.status === 'completed' ? 'rgba(13, 148, 136, 1)' : 'rgba(229, 231, 235, 1)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: step.status === 'active' ? 0.74 : 1
                }}>
                      <img src={`https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/${step.icon}`} alt="icon" style={{
                    width: '18px',
                    height: '16px'
                  }} />
                    </div>
                    <div style={{
                  marginLeft: '16px',
                  paddingTop: '4px'
                }}>
                      <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: step.status === 'active' ? 'rgba(249, 115, 22, 1)' : step.status === 'pending' ? 'rgba(107, 114, 128, 1)' : 'rgba(17, 24, 39, 1)'
                  }}>{step.label}</div>
                      <div style={{
                    fontSize: '14px',
                    color: step.status === 'pending' ? 'rgba(156, 163, 175, 1)' : 'rgba(75, 85, 99, 1)'
                  }}>{step.time}</div>
                    </div>
                  </div>)}
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section style={{
          width: '375px',
          height: '210px',
          position: 'relative'
        }}>
            <div style={{
            width: '343px',
            height: '194px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(243, 244, 246, 1)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'absolute',
            left: '16px',
            top: '0px'
          }}>
              <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              background: 'linear-gradient(180deg, #CCFBF1 0%, #99F6E4 100%)'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/e7633de0-9f57-485c-a4cb-d7a2c00c61d5.png" alt="map" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} />
                <div style={{
                position: 'absolute',
                left: '16px',
                top: '16px',
                backgroundColor: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                  <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'rgba(249, 115, 22, 1)',
                  borderRadius: '50%',
                  opacity: 0.6
                }} />
                  <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(17, 24, 39, 1)'
                }}>Live Tracking</span>
                </div>
              </div>
            </div>
          </section>

          {/* Rider Info Section */}
          <section style={{
          width: '375px',
          height: '150px',
          position: 'relative'
        }}>
            <div style={{
            width: '343px',
            height: '134px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(243, 244, 246, 1)',
            borderRadius: '12px',
            position: 'absolute',
            left: '16px',
            top: '0px',
            padding: '16px'
          }}>
              <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(17, 24, 39, 1)'
            }}>Your Rider</h3>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '12px',
              justifyContent: 'space-between'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/4c9066d0-fff4-4eba-ac15-d62eb495d5eb.jpg" alt="rider" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '9999px',
                  objectFit: 'cover'
                }} />
                  <div>
                    <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(17, 24, 39, 1)'
                  }}>Marco Santos</div>
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px'
                  }}>
                      <div style={{
                      display: 'flex'
                    }}>
                        {[...Array(5)].map((_, i) => <img key={i} src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6c084301-0317-4f1f-91aa-320ae6dbf12a.svg" alt="star" style={{
                        width: '12px',
                        height: '12px'
                      }} />)}
                      </div>
                      <span style={{
                      fontSize: '12px',
                      color: 'rgba(75, 85, 99, 1)',
                      marginLeft: '4px'
                    }}>4.9 • 1,234 deliveries</span>
                    </div>
                  </div>
                </div>
                <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                  <button onClick={handleMessage} onMouseEnter={buttonHoverStyle} onMouseLeave={buttonLeaveStyle} style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(204, 251, 241, 1)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/f66d0fa8-fce9-44ed-a7e6-325e8d0f7de6.svg" alt="chat" style={{
                    width: '16px',
                    height: '16px'
                  }} />
                  </button>
                  <button onClick={handleCall} onMouseEnter={buttonHoverStyle} onMouseLeave={buttonLeaveStyle} style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(243, 244, 246, 1)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1f0f3327-6f42-4434-993f-00d03b2cbc6d.svg" alt="call" style={{
                    width: '16px',
                    height: '16px'
                  }} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Order Details Section */}
          <section style={{
          width: '375px',
          height: '283px',
          position: 'relative'
        }}>
            <div style={{
            width: '343px',
            height: '267px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(243, 244, 246, 1)',
            borderRadius: '12px',
            position: 'absolute',
            left: '16px',
            top: '0px',
            padding: '16px'
          }}>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
                <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(17, 24, 39, 1)'
              }}>Order Details</span>
                <span style={{
                fontSize: '14px',
                color: 'rgba(75, 85, 99, 1)'
              }}>#OD2024-001</span>
              </div>
              
              <div style={{
              marginTop: '16px'
            }}>
                <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/f3114e3e-cddf-4a45-a750-1a22e38c2ae2.png" alt="item" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px'
                }} />
                  <div style={{
                  flex: 1
                }}>
                    <div style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'rgba(17, 24, 39, 1)'
                  }}>Adobo Rice Bowl</div>
                    <div style={{
                    fontSize: '14px',
                    color: 'rgba(75, 85, 99, 1)'
                  }}>Extra rice, No vegetables</div>
                    <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(17, 24, 39, 1)',
                    marginTop: '2px'
                  }}>₱285 × 2</div>
                  </div>
                </div>
                <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/57d448a2-52a3-4383-8870-4f90db037748.png" alt="item" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px'
                }} />
                  <div style={{
                  flex: 1
                }}>
                    <div style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'rgba(17, 24, 39, 1)'
                  }}>Lumpia Shanghai</div>
                    <div style={{
                    fontSize: '14px',
                    color: 'rgba(75, 85, 99, 1)'
                  }}>10 pieces</div>
                    <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(17, 24, 39, 1)',
                    marginTop: '2px'
                  }}>₱180 × 1</div>
                  </div>
                </div>
              </div>

              <div style={{
              borderTop: '1px solid rgba(229, 231, 235, 1)',
              marginTop: '24px',
              paddingTop: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
                <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(17, 24, 39, 1)'
              }}>Total Amount</span>
                <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'rgba(17, 24, 39, 1)'
              }}>₱1,260</span>
              </div>
            </div>
          </section>

          {/* Delivery Address Section */}
          <section style={{
          width: '375px',
          height: '143px',
          position: 'relative'
        }}>
            <div style={{
            width: '343px',
            height: '127px',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(243, 244, 246, 1)',
            borderRadius: '12px',
            position: 'absolute',
            left: '16px',
            top: '0px',
            padding: '16px',
            display: 'flex',
            gap: '12px'
          }}>
              <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(204, 251, 241, 1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/357cc501-a2c9-4fb6-b4db-0455d5a74a13.svg" alt="address" style={{
                width: '12px',
                height: '16px'
              }} />
              </div>
              <div>
                <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(17, 24, 39, 1)'
              }}>Delivery Address</h3>
                <p style={{
                margin: '6px 0',
                fontSize: '14px',
                color: 'rgba(75, 85, 99, 1)',
                lineHeight: '20px'
              }}>
                  Cloud 9 Boardwalk, General Luna,<br />Siargao Island, 8419
                </p>
                <p style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(107, 114, 128, 1)'
              }}>Contact: +63 917 123 4567</p>
              </div>
            </div>
          </section>
        </main>

        {/* Navigation Footer */}
        <nav style={{
        width: '375px',
        height: '81px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderTop: '1px solid rgba(229, 231, 235, 1)',
        position: 'absolute',
        left: '0px',
        top: '759px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 16px'
      }}>
          <button onClick={() => handleNavClick('home')} style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/21fd3498-dda2-4d54-aba5-60e221d1e75b.svg" alt="home" style={{
            width: '20px',
            height: '18px',
            opacity: activeTab === 'home' ? 1 : 0.5
          }} />
            <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: activeTab === 'home' ? 'rgba(13, 148, 136, 1)' : 'rgba(156, 163, 175, 1)'
          }}>Home</span>
          </button>

          <button onClick={() => handleNavClick('orders')} style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c1e9afa7-bcc0-49f4-bd49-1a2565637b3d.svg" alt="orders" style={{
            width: '18px',
            height: '18px',
            opacity: activeTab === 'orders' ? 1 : 0.5
          }} />
            <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: activeTab === 'orders' ? 'rgba(13, 148, 136, 1)' : 'rgba(156, 163, 175, 1)'
          }}>Orders</span>
          </button>

          <button onClick={() => handleNavClick('account')} style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6d4cebbc-e420-4a6a-90c2-a5bc0deefdf8.svg" alt="account" style={{
            width: '16px',
            height: '18px',
            opacity: activeTab === 'account' ? 1 : 0.5
          }} />
            <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: activeTab === 'account' ? 'rgba(13, 148, 136, 1)' : 'rgba(156, 163, 175, 1)'
          }}>Account</span>
          </button>
        </nav>
      </div>
    </div>;
};
