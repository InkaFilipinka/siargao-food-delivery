import React, { useState, useMemo } from 'react';
interface CartScreenProps {
  onNavigate?: (screen: string) => void;
}
export const CartScreen = ({ onNavigate }: CartScreenProps) => {
  const [qty1, setQty1] = useState(1);
  const [qty2, setQty2] = useState(2);
  const [cutlery, setCutlery] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const item1Price = 450;
  const item2Price = 380;
  const deliveryFee = 35;
  const serviceFee = 15;
  const subtotal = useMemo(() => qty1 * item1Price + qty2 * item2Price, [qty1, qty2]);
  const total = useMemo(() => subtotal + deliveryFee + serviceFee, [subtotal]);
  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString()}`;
  };
  const handleApplyPromo = () => {
    if (promoCode) {
      console.log('Applying promo:', promoCode);
    }
  };
  const buttonStyle: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease'
  };
  return <div className="mobile-container" style={{
    width: '100%',
    maxWidth: '375px',
    height: '840px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderColor: '#CED4DA',
    borderStyle: 'solid',
    borderWidth: '2px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif'
  }}>
      {/* Top Header */}
      <header style={{
      width: '100%',
      height: '104px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: 10,
      display: 'flex',
      alignItems: 'flex-end',
      padding: '0 16px 16px 16px',
      boxSizing: 'border-box'
    }}>
        <div style={{
        width: '100%',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
          <button onClick={() => onNavigate ? onNavigate('restaurant') : console.log('Back clicked')} style={{
          ...buttonStyle,
          width: '40px',
          height: '40px',
          backgroundColor: '#F3F4F6',
          borderRadius: '9999px'
        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} aria-label="Go back">
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/089524ce-cfa5-4ab2-b46d-be74dddf91c7.svg" alt="" style={{
            width: '14px',
            height: '16px'
          }} />
          </button>
          
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/bdd17685-bb86-4425-98dd-a99abc5510ee.svg" alt="" style={{
            width: '24px',
            height: '24px'
          }} />
            <span style={{
            color: '#111827',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '28px',
            letterSpacing: '-0.5px'
          }}>TravelGo</span>
          </div>

          <div style={{
          width: '40px'
        }} />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main style={{
      width: '100%',
      height: 'calc(100% - 185px)',
      marginTop: '104px',
      backgroundColor: '#FAFAF9',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '20px'
    }}>
        {/* Restaurant Info Section */}
        <section style={{
        width: '100%',
        height: '81px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F3F4F6',
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
            <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/94e84c2a-a568-4ce3-9944-9e7496e97255.svg" alt="" style={{
              width: '14px',
              height: '16px'
            }} />
            </div>
            <div>
              <div style={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              letterSpacing: '-0.5px'
            }}>Siargao Seafood House</div>
              <div style={{
              color: '#4B5563',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '-0.5px'
            }}>25-35 min • ₱35 delivery</div>
            </div>
          </div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/25fe3b86-37b5-4fc9-a6f3-7ede60c96662.svg" alt="" style={{
            width: '15.75px',
            height: '14px'
          }} />
            <span style={{
            color: '#000000',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px'
          }}>4.8</span>
          </div>
        </section>

        {/* Cart Items */}
        <section style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
          {/* Item 1 */}
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          display: 'flex',
          gap: '12px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/355fad5d-7153-4f46-a889-06264f47af96.png" alt="Grilled Lapu-Lapu" style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            objectFit: 'cover'
          }} />
            <div style={{
            flex: 1
          }}>
              <div style={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px'
            }}>Grilled Lapu-Lapu</div>
              <div style={{
              color: '#4B5563',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              marginBottom: '8px'
            }}>{formatCurrency(item1Price)}</div>
              
              <button style={{
              ...buttonStyle,
              gap: '4px',
              color: '#0D9488',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '12px'
            }} onClick={() => console.log('Add special instructions')}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/02f88153-2f86-41af-bae2-dd750788a9df.svg" alt="" style={{
                width: '10.5px',
                height: '12px'
              }} />
                Add special instructions
              </button>

              <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <button onClick={() => setQty1(Math.max(0, qty1 - 1))} style={{
                  ...buttonStyle,
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px'
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/92ce989f-baf8-43a7-80f3-d980eb0a2a03.svg" alt="Decrease" />
                  </button>
                  <span style={{
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: 500
                }}>{qty1}</span>
                  <button onClick={() => setQty1(qty1 + 1)} style={{
                  ...buttonStyle,
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#0D9488',
                  borderRadius: '8px'
                }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ade5c88b-dea0-4370-8db2-9cddb8e9a019.svg" alt="Increase" />
                  </button>
                </div>
                <button onClick={() => setQty1(0)} style={{
                ...buttonStyle
              }} aria-label="Remove item">
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/dd66d6aa-b7b2-405d-a3ab-25b5ef5281c7.svg" alt="" style={{
                  width: '12.25px',
                  height: '14px'
                }} />
                </button>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          display: 'flex',
          gap: '12px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/5e65f01b-0b99-4b04-af12-f2a0ecdc7e48.png" alt="Seafood Kare-Kare" style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            objectFit: 'cover'
          }} />
            <div style={{
            flex: 1
          }}>
              <div style={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px'
            }}>Seafood Kare-Kare</div>
              <div style={{
              color: '#4B5563',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              marginBottom: '8px'
            }}>{formatCurrency(item2Price)}</div>
              
              <div style={{
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              padding: '8px',
              marginBottom: '12px',
              position: 'relative'
            }}>
                <div style={{
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px'
              }}>Extra vegetables, no onions</div>
                <button onClick={() => console.log('Edit instruction')} style={{
                ...buttonStyle,
                color: '#0D9488',
                fontSize: '12px',
                fontWeight: 400,
                marginTop: '4px'
              }}>
                  Edit
                </button>
              </div>

              <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <button onClick={() => setQty2(Math.max(0, qty2 - 1))} style={{
                  ...buttonStyle,
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px'
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d6719e79-fa9d-418e-b1ae-7ee5afce4586.svg" alt="Decrease" />
                  </button>
                  <span style={{
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: 500
                }}>{qty2}</span>
                  <button onClick={() => setQty2(qty2 + 1)} style={{
                  ...buttonStyle,
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#0D9488',
                  borderRadius: '8px'
                }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/9c25f38b-724a-4d3a-8c9b-1e2dac1ace02.svg" alt="Increase" />
                  </button>
                </div>
                <button onClick={() => setQty2(0)} style={{
                ...buttonStyle
              }} aria-label="Remove item">
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/f4b572bf-0de7-4584-bc5a-bea8db60f1be.svg" alt="" style={{
                  width: '12.25px',
                  height: '14px'
                }} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cutlery Toggle Section */}
        <section style={{
        padding: '0 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
              <div style={{
              width: '37px',
              height: '40px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c9c61bc3-ea29-42a3-aec7-8cfcb52b3f5e.svg" alt="" style={{
                width: '14px',
                height: '16px'
              }} />
              </div>
              <div>
                <div style={{
                color: '#111827',
                fontSize: '16px',
                fontWeight: 500
              }}>Cutlery</div>
                <div style={{
                color: '#4B5563',
                fontSize: '14px',
                fontWeight: 400,
                whiteSpace: 'pre-line'
              }}>{`Add utensils, napkins &\ncondiments`}</div>
              </div>
            </div>
            <button onClick={() => setCutlery(!cutlery)} style={{
            ...buttonStyle,
            width: '44px',
            height: '24px',
            backgroundColor: cutlery ? '#0D9488' : '#D1D5DB',
            borderRadius: '9999px',
            position: 'relative',
            transition: 'background-color 0.3s ease'
          }} aria-pressed={cutlery}>
              <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              position: 'absolute',
              left: cutlery ? '22px' : '2px',
              transition: 'left 0.3s ease'
            }} />
            </button>
          </div>
        </section>

        {/* Promo Code Section */}
        <section style={{
        padding: '16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
            <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/61853751-7979-48be-86aa-9c497afbafc8.svg" alt="" style={{
              width: '14px',
              height: '16px'
            }} />
            </div>
            <input type="text" placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#111827',
            fontFamily: 'inherit'
          }} />
            <button onClick={handleApplyPromo} style={{
            ...buttonStyle,
            color: '#0D9488',
            fontSize: '14px',
            fontWeight: 600
          }}>
              Apply
            </button>
          </div>
        </section>

        {/* Order Summary Section */}
        <section style={{
        padding: '0 16px 16px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
            <div style={{
            color: '#111827',
            fontSize: '16px',
            fontWeight: 600
          }}>Order Summary</div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#4B5563',
            fontSize: '16px'
          }}>
              <span>{`Subtotal (${qty1 + qty2} items)`}</span>
              <span style={{
              color: '#111827'
            }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#4B5563',
            fontSize: '16px'
          }}>
              <span>Delivery fee</span>
              <span style={{
              color: '#111827'
            }}>{formatCurrency(deliveryFee)}</span>
            </div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#4B5563',
            fontSize: '16px'
          }}>
              <span>Service fee</span>
              <span style={{
              color: '#111827'
            }}>{formatCurrency(serviceFee)}</span>
            </div>
            <div style={{
            borderTop: '1px solid #E5E7EB',
            marginTop: '4px',
            paddingTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
              <span style={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 600
            }}>Total</span>
              <span style={{
              color: '#111827',
              fontSize: '18px',
              fontWeight: 700
            }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Action Area */}
      <div style={{
      width: '100%',
      height: '93px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      position: 'absolute',
      left: '0',
      top: '683px',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '17px',
      zIndex: 10
    }}>
        <button onClick={() => onNavigate ? onNavigate('checkout') : console.log('Proceed to checkout')} style={{
        ...buttonStyle,
        width: '343px',
        height: '60px',
        backgroundColor: '#0D9488',
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: 600,
        letterSpacing: '-0.5px'
      }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {`Proceed to Checkout • ${formatCurrency(total)}`}
        </button>
      </div>

      {/* Navigation Footer */}
      <nav style={{
      width: '100%',
      height: '81px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      position: 'absolute',
      left: '0',
      top: '759px',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 16px'
    }}>
        <button onClick={() => onNavigate ? onNavigate('home') : setActiveTab('home')} style={{
        ...buttonStyle,
        flexDirection: 'column',
        gap: '4px',
        width: '64px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/b76ffe6a-72a6-43e0-95b9-0b0f96693780.svg" alt="Home" style={{
          width: '20px',
          height: '18px',
          filter: activeTab === 'home' ? 'none' : 'grayscale(100%) opacity(0.5)'
        }} />
          <span style={{
          color: activeTab === 'home' ? '#0D9488' : '#9CA3AF',
          fontSize: '12px',
          fontWeight: 500
        }}>Home</span>
        </button>

        <button onClick={() => onNavigate ? onNavigate('orders') : setActiveTab('orders')} style={{
        ...buttonStyle,
        flexDirection: 'column',
        gap: '4px',
        width: '64px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/4bb7321b-a60d-4338-9e06-4ccb156cb2b8.svg" alt="Orders" style={{
          width: '18px',
          height: '18px',
          filter: activeTab === 'orders' ? 'none' : 'grayscale(100%) opacity(0.5)'
        }} />
          <span style={{
          color: activeTab === 'orders' ? '#0D9488' : '#9CA3AF',
          fontSize: '12px',
          fontWeight: 500
        }}>Orders</span>
        </button>

        <button onClick={() => onNavigate ? onNavigate('account') : setActiveTab('account')} style={{
        ...buttonStyle,
        flexDirection: 'column',
        gap: '4px',
        width: '64px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/bb2aac90-b538-49b4-8cb8-90454a2ac7c9.svg" alt="Account" style={{
          width: '16px',
          height: '18px',
          filter: activeTab === 'account' ? 'none' : 'grayscale(100%) opacity(0.5)'
        }} />
          <span style={{
          color: activeTab === 'account' ? '#0D9488' : '#9CA3AF',
          fontSize: '12px',
          fontWeight: 500
        }}>Account</span>
        </button>
      </nav>
    </div>;
};
