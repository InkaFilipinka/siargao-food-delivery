import React, { useState } from 'react';
interface TripItemProps {
  orderId: string;
  route: string;
  time: string;
  amount: string;
  type: 'Digital' | 'Cash';
  iconUrl: string;
  typeIconUrl: string;
}
const TripItem = ({
  orderId,
  route,
  time,
  amount,
  type,
  iconUrl,
  typeIconUrl
}: TripItemProps) => <div style={{
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 1)',
  border: '1px solid rgba(229, 231, 235, 1)',
  boxSizing: 'border-box',
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
}} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'}>
    <div style={{
    display: 'flex',
    gap: '12px'
  }}>
      <div style={{
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(220, 252, 231, 1)',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
        <img src={iconUrl} alt="trip icon" style={{
        width: '14px',
        height: '16px'
      }} />
      </div>
      <div>
        <div style={{
        color: 'rgba(17, 24, 39, 1)',
        fontSize: '14px',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        lineHeight: '20px'
      }}>
          Order #{orderId}
        </div>
        <div style={{
        color: 'rgba(75, 85, 99, 1)',
        fontSize: '12px',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        lineHeight: '16px',
        whiteSpace: 'pre-line'
      }}>
          {route}
        </div>
        <div style={{
        color: 'rgba(107, 114, 128, 1)',
        fontSize: '12px',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        lineHeight: '16px',
        marginTop: '4px'
      }}>
          Completed {time}
        </div>
      </div>
    </div>
    <div style={{
    textAlign: 'right'
  }}>
      <div style={{
      color: 'rgba(13, 148, 136, 1)',
      fontSize: '16px',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      lineHeight: '24px'
    }}>
        ₱{amount}
      </div>
      <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '4px',
      marginTop: '4px'
    }}>
        <img src={typeIconUrl} alt="payment type" style={{
        width: '13.5px',
        height: '12px'
      }} />
        <span style={{
        color: 'rgba(107, 114, 128, 1)',
        fontSize: '12px',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400
      }}>{type}</span>
      </div>
    </div>
  </div>;
interface ProductOrderCardProps {
  onNavigate?: (screen: string) => void;
}
export const ProductOrderCard = ({ onNavigate }: ProductOrderCardProps) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const handleAction = (action: string) => {
    if (onNavigate) {
      const map: Record<string, string> = { nav_hub: 'driver-hub', nav_earnings: 'driver-earnings' };
      if (map[action]) onNavigate(map[action]!);
      return;
    }
    console.log(`Action triggered: ${action}`);
  };
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    minHeight: '840px',
    backgroundColor: 'rgba(250, 250, 249, 1)',
    border: '2px solid rgba(206, 212, 218, 1)',
    boxSizing: 'border-box',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif'
  }}>
      {/* Header */}
      <header style={{
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderBottom: '1px solid rgba(229, 231, 235, 1)',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      padding: '48px 16px 16px 16px'
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/945b8483-5102-44f4-bc6f-9c1abe501600.svg" alt="logo" style={{
            width: '28px',
            height: '28px'
          }} />
            <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: 'rgba(17, 24, 39, 1)',
            letterSpacing: '-0.5px'
          }}>TravelGo</h1>
          </div>
          <button onClick={() => handleAction('notifications')} style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(243, 244, 246, 1)',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/e1220784-04fb-465b-8c72-3052f13b5b95.svg" alt="notifications" />
          </button>
        </div>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/a15738f6-561c-4a4e-a9e6-ad1ce72a8d95.jpg" alt="profile" style={{
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          objectFit: 'cover'
        }} />
          <div>
            <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(17, 24, 39, 1)'
          }}>Carlos Rivera</div>
            <div style={{
            fontSize: '12px',
            color: 'rgba(107, 114, 128, 1)'
          }}>⭐ 4.9 • 342 deliveries</div>
          </div>
        </div>
      </header>

      <main style={{
      padding: '16px',
      paddingBottom: '100px'
    }}>
        {/* Tab Switcher */}
        <div style={{
        backgroundColor: 'rgba(255, 255, 255, 1)',
        border: '1px solid rgba(229, 231, 235, 1)',
        borderRadius: '12px',
        padding: '4px',
        display: 'flex',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        marginBottom: '16px'
      }}>
          <button onClick={() => setActiveTab('daily')} style={{
          flex: 1,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          backgroundColor: activeTab === 'daily' ? 'rgba(13, 148, 136, 1)' : 'transparent',
          color: activeTab === 'daily' ? '#FFF' : 'rgba(75, 85, 99, 1)',
          transition: 'all 0.2s'
        }}>
            Daily
          </button>
          <button onClick={() => setActiveTab('weekly')} style={{
          flex: 1,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          backgroundColor: activeTab === 'weekly' ? 'rgba(13, 148, 136, 1)' : 'transparent',
          color: activeTab === 'weekly' ? '#FFF' : 'rgba(75, 85, 99, 1)',
          transition: 'all 0.2s'
        }}>
            Weekly
          </button>
        </div>

        {/* Earnings Card */}
        <section style={{
        background: 'linear-gradient(180deg, rgba(13, 148, 136, 1) 0%, rgba(15, 118, 110, 1) 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: '#FFF',
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
          <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
            <div style={{
            color: 'rgba(204, 251, 241, 1)',
            fontSize: '14px',
            marginBottom: '4px'
          }}>Today's Total Earnings</div>
            <div style={{
            fontSize: '30px',
            fontWeight: 700,
            marginBottom: '4px'
          }}>₱840</div>
            <div style={{
            color: 'rgba(204, 251, 241, 1)',
            fontSize: '14px'
          }}>4 completed trips</div>
          </div>
          <div style={{
          display: 'flex',
          gap: '12px'
        }}>
            <div style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '12px',
            borderRadius: '8px'
          }}>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/b373936c-e961-44ee-aa8e-36a21d7062a3.svg" alt="cash" style={{
                width: '15.75px'
              }} />
                <span style={{
                fontSize: '14px',
                fontWeight: 500
              }}>Cash</span>
              </div>
              <div style={{
              fontSize: '20px',
              fontWeight: 700
            }}>₱320</div>
              <div style={{
              color: 'rgba(204, 251, 241, 1)',
              fontSize: '12px',
              marginTop: '4px'
            }}>2 orders</div>
            </div>
            <div style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '12px',
            borderRadius: '8px'
          }}>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/28364f8a-2fbb-434a-9bf4-2894666f5a1c.svg" alt="digital" style={{
                width: '15.75px'
              }} />
                <span style={{
                fontSize: '14px',
                fontWeight: 500
              }}>Digital</span>
              </div>
              <div style={{
              fontSize: '20px',
              fontWeight: 700
            }}>₱520</div>
              <div style={{
              color: 'rgba(204, 251, 241, 1)',
              fontSize: '12px',
              marginTop: '4px'
            }}>2 orders</div>
            </div>
          </div>
        </section>

        {/* Incentives */}
        <section style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(229, 231, 235, 1)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
            <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'rgba(17, 24, 39, 1)'
          }}>Active Incentives</span>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/565d50c5-fcbb-4509-b5bc-3e6894d5df09.svg" alt="info" style={{
            cursor: 'pointer'
          }} />
          </div>
          
          <div style={{
          backgroundColor: 'rgba(249, 115, 22, 1)',
          borderRadius: '8px',
          padding: '12px',
          color: '#FFF',
          marginBottom: '12px'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
              <span style={{
              fontSize: '14px',
              fontWeight: 600
            }}>Peak Hours Bonus</span>
              <span style={{
              fontSize: '12px',
              fontWeight: 500
            }}>Active</span>
            </div>
            <div style={{
            fontSize: '12px',
            marginBottom: '12px'
          }}>Extra ₱25 per delivery during 6-9 PM</div>
            <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            marginBottom: '8px',
            position: 'relative'
          }}>
              <div style={{
              width: '66%',
              height: '100%',
              backgroundColor: '#FFF',
              borderRadius: '9999px'
            }} />
            </div>
            <div style={{
            fontSize: '12px'
          }}>2 of 3 deliveries completed</div>
          </div>

          <div style={{
          backgroundColor: 'rgba(249, 250, 251, 1)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(229, 231, 235, 1)'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
              <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(17, 24, 39, 1)'
            }}>Weekly Target</span>
              <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(75, 85, 99, 1)'
            }}>In Progress</span>
            </div>
            <div style={{
            fontSize: '12px',
            color: 'rgba(75, 85, 99, 1)',
            marginBottom: '12px'
          }}>Complete 30 deliveries for ₱500 bonus</div>
            <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(229, 231, 235, 1)',
            borderRadius: '9999px',
            marginBottom: '8px',
            position: 'relative'
          }}>
              <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: 'rgba(13, 148, 136, 1)',
              borderRadius: '9999px'
            }} />
            </div>
            <div style={{
            fontSize: '12px',
            color: 'rgba(75, 85, 99, 1)'
          }}>15 of 30 deliveries completed</div>
          </div>
        </section>

        {/* Payout Method */}
        <section style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(229, 231, 235, 1)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
            <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'rgba(17, 24, 39, 1)'
          }}>Payout Method</span>
            <button onClick={() => handleAction('change_payout')} style={{
            background: 'none',
            border: 'none',
            color: 'rgba(13, 148, 136, 1)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
              Change
            </button>
          </div>
          <div style={{
          backgroundColor: 'rgba(249, 250, 251, 1)',
          borderRadius: '8px',
          padding: '12px',
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
              backgroundColor: 'rgba(219, 234, 254, 1)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/cd8fb2b0-6e50-460f-8028-a1e68a164501.svg" alt="bank" />
              </div>
              <div>
                <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(17, 24, 39, 1)'
              }}>BPI Bank</div>
                <div style={{
                fontSize: '12px',
                color: 'rgba(75, 85, 99, 1)'
              }}>•••• •••• •••• 4521</div>
              </div>
            </div>
            <div style={{
            textAlign: 'right'
          }}>
              <div style={{
              fontSize: '12px',
              color: 'rgba(107, 114, 128, 1)'
            }}>Next payout</div>
              <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(17, 24, 39, 1)'
            }}>Tomorrow</div>
            </div>
          </div>
        </section>

        {/* Trips List */}
        <section>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
            <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'rgba(17, 24, 39, 1)'
          }}>Today's Trips</span>
            <button onClick={() => handleAction('view_all_trips')} style={{
            background: 'none',
            border: 'none',
            color: 'rgba(13, 148, 136, 1)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
              View All
            </button>
          </div>
          <TripItem orderId="2847" route="Siargao Bowl Co. → Beachfront Resort" time="2:45 PM" amount="85" type="Digital" iconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/9b257389-2b27-4927-ba68-e03a6f495bdf.svg" typeIconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/130c0ffb-1db8-414f-88ac-5110b944122f.svg" />
          <TripItem orderId="2846" route="Island Grill → Cloud 9 Hostel" time="1:20 PM" amount="120" type="Cash" iconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/f4d9bf72-eca3-49f3-b2b5-7a957bb663f0.svg" typeIconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d9f71cfd-e4c6-441d-8ae2-f9fc68ff12e6.svg" />
          <TripItem orderId="2845" route="Mama's Grill → Dapa Port" time="12:10 PM" amount="95" type="Digital" iconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/249bff9e-d679-402f-a27e-963a0707ff0d.svg" typeIconUrl="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c9c0ca62-b026-4b76-b732-7de6b6e03991.svg" />
        </section>
      </main>

      {/* Bottom Navigation */}
      <footer style={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '81px',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderTop: '1px solid rgba(229, 231, 235, 1)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: '8px'
    }}>
        <button onClick={() => handleAction('nav_hub')} style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/dac388fd-d8f6-4c3a-b95b-880a6f4f95a1.svg" alt="hub" style={{
          opacity: 0.5
        }} />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'rgba(156, 163, 175, 1)'
        }}>Driver Hub</span>
        </button>
        <button onClick={() => handleAction('nav_earnings')} style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c277cec9-ff82-45e9-b85a-dd85b5122266.svg" alt="earnings" />
          <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'rgba(13, 148, 136, 1)'
        }}>Earnings</span>
        </button>
      </footer>
    </div>;
};
