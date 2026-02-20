import React, { useState } from 'react';
interface CheckoutFormProps {
  onNavigate?: (screen: string) => void;
}
export const CheckoutForm = ({ onNavigate }: CheckoutFormProps) => {
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'schedule'>('asap');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash' | 'card'>('cod');
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');
  const subtotal = 1210;
  const deliveryFee = 35;
  const serviceFee = 15;
  const total = subtotal + deliveryFee + serviceFee + (tipAmount || 0);
  const formatCurrency = (val: number) => `₱${val.toLocaleString()}`;
  const buttonStyle = {
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    transition: 'opacity 0.2s ease'
  };
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    height: '840px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    border: '2px solid #CED4DA',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif'
  }}>
      {/* Header */}
      <header style={{
      width: '100%',
      height: '104px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      zIndex: 10,
      flexShrink: 0
    }}>
        <div style={{
        position: 'relative',
        width: '343px',
        height: '40px',
        margin: '48px auto 0'
      }}>
          <button style={{
          ...buttonStyle,
          width: '40px',
          height: '40px',
          backgroundColor: '#F3F4F6',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => onNavigate ? onNavigate('cart') : console.log('Back')}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/4e7a3459-f29a-45de-a7a7-7d9f0acc2c58.svg" alt="Back" style={{
            width: '14px',
            height: '16px'
          }} />
          </button>
          
          <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6e9c9c65-6cef-4478-b9fa-ce3baf117223.svg" alt="Checkout" style={{
            width: '24px',
            height: '24px'
          }} />
            <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>Checkout</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
      flex: 1,
      overflowY: 'auto',
      backgroundColor: '#FAFAF9',
      paddingBottom: '180px'
    }}>
        {/* Delivery Address */}
        <section style={{
        padding: '16px 16px 8px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px'
          }}>
              <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/fe796c5f-0248-4af4-9b8d-834a233cc636.svg" alt="Address" style={{
                width: '12px',
                height: '16px'
              }} />
              </div>
              <div>
                <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 4px',
                letterSpacing: '-0.5px'
              }}>Delivery Address</h3>
                <p style={{
                fontSize: '14px',
                color: '#4B5569',
                margin: 0,
                lineHeight: '23px',
                whiteSpace: 'pre-line',
                letterSpacing: '-0.5px'
              }}>
                  Cloud 9 Boardwalk, General{'\n'}Luna, Siargao Island, 8419
                </p>
              </div>
            </div>
            <button style={{
            ...buttonStyle,
            color: '#0D9488',
            fontSize: '14px',
            fontWeight: 500
          }} onClick={() => console.log('Change Address')}>
              Change
            </button>
          </div>
        </section>

        {/* Contact Number */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px',
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
              width: '40px',
              height: '40px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/fae9c140-d681-4ec9-9dc4-03d11e10fe28.svg" alt="Phone" style={{
                width: '16px',
                height: '16px'
              }} />
              </div>
              <div>
                <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 4px',
                letterSpacing: '-0.5px'
              }}>Contact Number</h3>
                <p style={{
                fontSize: '14px',
                color: '#4B5569',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>+63 917 123 4567</p>
              </div>
            </div>
            <button style={{
            ...buttonStyle,
            color: '#0D9488',
            fontSize: '14px',
            fontWeight: 500
          }} onClick={() => console.log('Edit Phone')}>
              Edit
            </button>
          </div>
        </section>

        {/* Delivery Instructions */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
              <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/09ca6fbf-61de-4f4b-881f-691abce3e73b.svg" alt="Instructions" style={{
                width: '16px',
                height: '16px'
              }} />
              </div>
              <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              margin: '8px 0 0',
              letterSpacing: '-0.5px'
            }}>Delivery Instructions</h3>
            </div>
            <textarea placeholder="Add notes for the rider (e.g., gate code, landmarks)" value={instructions} onChange={e => setInstructions(e.target.value)} style={{
            width: '100%',
            height: '84px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            color: '#111827',
            resize: 'none',
            boxSizing: 'border-box',
            outline: 'none'
          }} />
          </div>
        </section>

        {/* Delivery Time */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            alignItems: 'center'
          }}>
              <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/275c2c26-b5eb-40b1-ada5-ef6eb69a4b97.svg" alt="Time" style={{
                width: '16px',
                height: '16px'
              }} />
              </div>
              <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>Delivery Time</h3>
            </div>
            <div style={{
            display: 'flex',
            gap: '8px'
          }}>
              <button onClick={() => setDeliveryTime('asap')} style={{
              ...buttonStyle,
              flex: 1,
              height: '64px',
              backgroundColor: deliveryTime === 'asap' ? '#0D9488' : '#F3F4F6',
              color: deliveryTime === 'asap' ? '#FFFFFF' : '#374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2'
            }}>
                <span>ASAP (25-35</span>
                <span>min)</span>
              </button>
              <button onClick={() => setDeliveryTime('schedule')} style={{
              ...buttonStyle,
              flex: 1,
              height: '64px',
              backgroundColor: deliveryTime === 'schedule' ? '#0D9488' : '#F3F4F6',
              color: deliveryTime === 'schedule' ? '#FFFFFF' : '#374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                Schedule
              </button>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            alignItems: 'center'
          }}>
              <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/55c12734-d252-4e29-bbc6-4fd62cf4f530.svg" alt="Payment" style={{
                width: '18px',
                height: '16px'
              }} />
              </div>
              <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>Payment Method</h3>
            </div>
            
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
              <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              height: '56px',
              backgroundColor: paymentMethod === 'cod' ? '#F0FDFA' : '#F9FAFB',
              border: paymentMethod === 'cod' ? '2px solid #0D9488' : '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/2e5dcf5e-d4b8-4a37-866f-b900b2868e5f.svg" alt="Cash" style={{
                  width: '20px'
                }} />
                  <span style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#111827'
                }}>Cash on Delivery</span>
                </div>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#0075FF'
              }} />
              </label>

              <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              height: '54px',
              backgroundColor: paymentMethod === 'gcash' ? '#F0FDFA' : '#F9FAFB',
              border: paymentMethod === 'gcash' ? '2px solid #0D9488' : '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/ebbee69e-f5e1-4386-ba89-b405e8636b1c.svg" alt="GCash" style={{
                  width: '18px'
                }} />
                  <span style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: paymentMethod === 'gcash' ? '#111827' : '#374151'
                }}>GCash</span>
                </div>
                <input type="radio" name="payment" checked={paymentMethod === 'gcash'} onChange={() => setPaymentMethod('gcash')} style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#0075FF'
              }} />
              </label>

              <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              height: '54px',
              backgroundColor: paymentMethod === 'card' ? '#F0FDFA' : '#F9FAFB',
              border: paymentMethod === 'card' ? '2px solid #0D9488' : '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/9ef1ed09-f75b-4d8c-9695-25dd2ff5a182.svg" alt="Card" style={{
                  width: '20px'
                }} />
                  <span style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: paymentMethod === 'card' ? '#111827' : '#374151'
                }}>Credit/Debit Card</span>
                </div>
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#0075FF'
              }} />
              </label>
            </div>
          </div>
        </section>

        {/* Tip Your Rider */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px'
        }}>
            <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
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
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6f42967b-3009-46ae-8fc3-f924bdb2cfe3.svg" alt="Tip" style={{
                width: '16px',
                height: '16px'
              }} />
              </div>
              <div>
                <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 2px',
                letterSpacing: '-0.5px'
              }}>Tip your rider</h3>
                <p style={{
                fontSize: '12px',
                color: '#4B5563',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>100% goes to the rider</p>
              </div>
            </div>
            <div style={{
            display: 'flex',
            gap: '8px'
          }}>
              {[20, 50, 100].map(amount => <button key={amount} onClick={() => setTipAmount(amount)} style={{
              ...buttonStyle,
              flex: 1,
              height: '36px',
              backgroundColor: tipAmount === amount ? '#0D9488' : '#F3F4F6',
              color: tipAmount === amount ? '#FFFFFF' : '#374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500
            }}>
                  ₱{amount}
                </button>)}
              <button onClick={() => setTipAmount(0)} style={{
              ...buttonStyle,
              flex: 1,
              height: '36px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500
            }}>
                Other
              </button>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section style={{
        padding: '8px 16px'
      }}>
          <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          padding: '16px'
        }}>
            <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 16px',
            letterSpacing: '-0.5px'
          }}>Order Summary</h3>
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#4B5563'
            }}>
                <span>Subtotal (3 items)</span>
                <span style={{
                color: '#111827'
              }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#4B5563'
            }}>
                <span>Delivery fee</span>
                <span style={{
                color: '#111827'
              }}>{formatCurrency(deliveryFee)}</span>
              </div>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#4B5563'
            }}>
                <span>Service fee</span>
                <span style={{
                color: '#111827'
              }}>{formatCurrency(serviceFee)}</span>
              </div>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#4B5563'
            }}>
                <span>Rider tip</span>
                <span style={{
                color: '#111827'
              }}>{formatCurrency(tipAmount || 0)}</span>
              </div>
              <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
                <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827'
              }}>Total</span>
                <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827'
              }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <footer style={{
      position: 'absolute',
      bottom: '81px',
      left: 0,
      width: '100%',
      height: '93px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      boxSizing: 'border-box',
      zIndex: 20
    }}>
        <button onClick={() => onNavigate ? onNavigate('track') : console.log('Placing order...')} style={{
        ...buttonStyle,
        width: '100%',
        height: '60px',
        backgroundColor: '#0D9488',
        borderRadius: '12px',
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: 600,
        letterSpacing: '-0.5px'
      }}>
          Place Order • {formatCurrency(total)}
        </button>
      </footer>

      {/* Bottom Navigation */}
      <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '81px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '9px 16px 0',
      boxSizing: 'border-box',
      zIndex: 30
    }}>
        <button style={{
        ...buttonStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '58px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d4171566-3b68-41ab-be61-d211b4cd729a.svg" alt="Home" style={{
          width: '20px',
          height: '18px',
          marginBottom: '4px'
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#0D9488'
        }}>Home</span>
        </button>
        <button style={{
        ...buttonStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '63px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/331aceb3-e0ae-47c9-9969-9c685e758944.svg" alt="Orders" style={{
          width: '18px',
          height: '18px',
          marginBottom: '4px'
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#9CA3AF'
        }}>Orders</span>
        </button>
        <button style={{
        ...buttonStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '72px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1046fa19-308f-4a32-a7bc-4f7ce0d3882c.svg" alt="Account" style={{
          width: '16px',
          height: '18px',
          marginBottom: '4px'
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#9CA3AF'
        }}>Account</span>
        </button>
      </nav>
    </div>;
};
