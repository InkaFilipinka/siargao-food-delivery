import React, { useState } from 'react';
interface FoodDeliveryHeroProps {
  onNavigate?: (screen: string) => void;
}
export const FoodDeliveryHero = ({ onNavigate }: FoodDeliveryHeroProps) => {
  const [location, setLocation] = useState('General Luna');
  const handleOrderClick = () => {
    onNavigate ? onNavigate('home') : console.log('Navigating to food ordering...');
  };
  const handleLocationClick = () => {
    if (!onNavigate) console.log('Opening location picker...');
  };
  const handleBookTripClick = () => {
    onNavigate ? onNavigate('partner-login') : console.log('Navigating to trip booking...');
  };
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    minHeight: '1193px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    border: '2px solid #CED4DA',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Inter", sans-serif'
  }}>
      <div style={{
      width: '100%',
      height: '1193px',
      backgroundColor: '#FAFAF9',
      position: 'relative',
      overflow: 'hidden'
    }}>
        {/* Background Decorative Circles */}
        <div style={{
        width: '64px',
        height: '64px',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '295px',
        top: '80px'
      }} />
        <div style={{
        width: '32px',
        height: '32px',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '16px',
        top: '160px'
      }} />
        <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '303px',
        top: '985px'
      }} />

        {/* Header Section */}
        <header style={{
        width: '100%',
        height: '124px',
        position: 'absolute',
        left: '0px',
        top: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/bb0086f8-cb12-458c-9a03-5ddd73b10ea9.svg" alt="TravelGo Logo" style={{
            width: '32px',
            height: '32px'
          }} />
            <span style={{
            color: '#111827',
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: '32px',
            letterSpacing: '-0.5px'
          }}>
              TravelGo
            </span>
          </div>
          <div style={{
          marginTop: '8px'
        }}>
            <span style={{
            color: '#4B5563',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '-0.5px'
          }}>
              Siargao Island
            </span>
          </div>
        </header>

        {/* Hero Content */}
        <section style={{
        width: '100%',
        height: '479px',
        position: 'absolute',
        left: '0px',
        top: '124px'
      }}>
          <div style={{
          padding: '32px 24px',
          textAlign: 'center'
        }}>
            <h1 style={{
            margin: '0 auto',
            width: '327px',
            height: '75px',
            display: 'flex',
            justifyContent: 'center'
          }}>
              <span style={{
              color: '#000000',
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: '36px',
              letterSpacing: '-0.5px'
            }}>
                Island Life<br />Delivered
              </span>
            </h1>
            <p style={{
            width: '279px',
            margin: '19px auto 0',
            color: '#4B5563',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '26px',
            letterSpacing: '-0.5px'
          }}>
              Fresh local food and seamless delivery across Siargao's beautiful barangays
            </p>
          </div>
          <div style={{
          width: '327px',
          height: '192px',
          margin: '0 24px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1e7609d2-2cda-4fa6-af3a-31d7858bde4c.png" alt="Fresh Island Food" style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} />
            <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%)'
          }} />
          </div>
        </section>

        {/* Location Picker */}
        <section style={{
        width: '100%',
        height: '82px',
        position: 'absolute',
        left: '0px',
        top: '603px',
        padding: '0 24px'
      }}>
          <div style={{
          width: '327px',
          height: '82px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 17px'
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
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8965a059-bfc0-4033-a90c-d860c84c92f4.svg" alt="Location" style={{
              width: '12px',
              height: '16px'
            }} />
            </div>
            <div style={{
            marginLeft: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}>
              <span style={{
              color: '#111827',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              letterSpacing: '-0.5px'
            }}>Deliver to</span>
              <button onClick={handleLocationClick} style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              outline: 'none'
            }}>
                <span style={{
                color: '#4B5563',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '-0.5px'
              }}>{location}</span>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3ae17146-c366-4c62-bf00-b0f230cdc8d0.svg" alt="Arrow" style={{
                width: '12px',
                height: '12px'
              }} />
              </button>
            </div>
          </div>
        </section>

        {/* Primary Action Button */}
        <section style={{
        width: '100%',
        height: '116px',
        position: 'absolute',
        left: '0px',
        top: '717px',
        padding: '0 24px'
      }}>
          <button onClick={handleOrderClick} style={{
          width: '327px',
          height: '116px',
          backgroundColor: '#0D9488',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          transition: 'transform 0.2s ease, background-color 0.2s ease',
          textAlign: 'left'
        }} onMouseOver={e => {
          e.currentTarget.style.backgroundColor = '#0F766E';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={e => {
          e.currentTarget.style.backgroundColor = '#0D9488';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
            <div style={{
            flex: 1
          }}>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
                <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c175cce7-6642-46d6-ad3b-0d642b0d7ad1.svg" alt="Food" style={{
                  width: '14px',
                  height: '16px'
                }} />
                </div>
                <span style={{
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '28px',
                letterSpacing: '-0.5px'
              }}>Order Food</span>
              </div>
              <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '-0.5px',
              margin: 0
            }}>
                Browse local restaurants & cafes
              </p>
            </div>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d280898f-2cb4-4793-994d-2321b426781a.svg" alt="Arrow" style={{
            width: '16px',
            height: '18px'
          }} />
          </button>
        </section>

        {/* Feature Cards */}
        <section style={{
        width: '100%',
        height: '132px',
        position: 'absolute',
        left: '0px',
        top: '865px',
        padding: '0 24px',
        display: 'flex',
        gap: '16px'
      }}>
          {/* Card 1 */}
          <div style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px'
        }}>
            <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c501d5f2-7fa4-405a-a378-05dc920844da.svg" alt="Local" style={{
              width: '18px',
              height: '18px'
            }} />
            </div>
            <h3 style={{
            color: '#111827',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '-0.5px',
            margin: '0 0 4px 0'
          }}>Local Fresh</h3>
            <span style={{
            color: '#4B5563',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            letterSpacing: '-0.5px'
          }}>Farm to table quality</span>
          </div>
          {/* Card 2 */}
          <div style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px'
        }}>
            <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/20d01f32-4d55-4405-9af2-1cd189df33bb.svg" alt="Love" style={{
              width: '18px',
              height: '18px'
            }} />
            </div>
            <h3 style={{
            color: '#111827',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '-0.5px',
            margin: '0 0 4px 0'
          }}>Island Love</h3>
            <span style={{
            color: '#4B5563',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            letterSpacing: '-0.5px'
          }}>Supporting locals</span>
          </div>
        </section>

        {/* Tertiary Action Banner */}
        <section style={{
        width: '100%',
        height: '132px',
        position: 'absolute',
        left: '0px',
        top: '1029px',
        padding: '0 24px'
      }}>
          <button onClick={handleBookTripClick} style={{
          width: '100%',
          height: '100px',
          background: 'linear-gradient(180deg, #0D9488 0%, #0F766E 100%)',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          transition: 'opacity 0.2s ease'
        }} onMouseOver={e => e.currentTarget.style.opacity = '0.95'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '9px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/689fe540-8af9-4819-87ec-60bfb65fcaef.svg" alt="Trip" style={{
              width: '18px',
              height: '16px'
            }} />
              <span style={{
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              letterSpacing: '-0.5px'
            }}>Book a Trip</span>
            </div>
            <span style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '-0.5px'
          }}>
              Get best Tourist Tours on the Island
            </span>
          </button>
        </section>

        {/* Spacer / Footer Area */}
        <div style={{
        width: '375px',
        height: '32px',
        position: 'absolute',
        left: '0px',
        top: '1161px'
      }} />
      </div>
    </div>;
};
