import React, { useState } from 'react';
interface LoginScreenProps {
  onBack?: () => void;
  onSignIn?: (data: any) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onSocialLogin?: (platform: string) => void;
  onRoleChange?: (role: 'driver' | 'restaurant') => void;
}
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onSignIn,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
  onRoleChange
}) => {
  const [role, setRole] = useState<'driver' | 'restaurant'>('restaurant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const handleRoleToggle = (selectedRole: 'driver' | 'restaurant') => {
    setRole(selectedRole);
    onRoleChange?.(selectedRole);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn?.({
      email,
      password,
      role,
      rememberMe
    });
  };
  const baseTextStyles: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif',
    letterSpacing: '-0.5px'
  };
  return <div className="login-screen-container" style={{
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  }}>
      <main style={{
      width: '375px',
      height: '1056.5px',
      backgroundColor: 'rgba(250, 250, 249, 1)',
      borderColor: 'rgba(206, 212, 218, 1)',
      borderStyle: 'solid',
      borderWidth: '2px',
      boxSizing: 'border-box',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }}>
        {/* Background Decorative Circles */}
        <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '303px',
        top: '128px'
      }} />
        <div style={{
        width: '64px',
        height: '64px',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '24px',
        top: '832.5px'
      }} />
        <div style={{
        width: '24px',
        height: '24px',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '9999px',
        position: 'absolute',
        left: '32px',
        top: '280px'
      }} />

        {/* Header Section */}
        <header style={{
        width: '375px',
        height: '124px',
        position: 'absolute',
        left: '0px',
        top: '0px'
      }}>
          <button onClick={onBack} aria-label="Go back" style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid rgba(229, 231, 235, 1)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '9999px',
          position: 'absolute',
          left: '24px',
          top: '48px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          zIndex: 10
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/356f50aa-d71c-4a5f-ba60-b20e33ecde42.svg" alt="Back" style={{
            width: '14px',
            height: '16px'
          }} />
          </button>

          <div style={{
          width: '145.125px',
          height: '32px',
          position: 'absolute',
          left: '115px',
          top: '48px',
          display: 'flex',
          alignItems: 'center'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8bbd950f-0ba9-457c-ac78-07f92a64f9af.svg" alt="TravelGo" style={{
            width: '32px',
            height: '32px'
          }} />
            <span style={{
            ...baseTextStyles,
            fontSize: '24px',
            fontWeight: 700,
            color: 'rgba(17, 24, 39, 1)',
            marginLeft: '8px'
          }}>TravelGo</span>
          </div>

          <span style={{
          ...baseTextStyles,
          width: '375px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(249, 115, 22, 1)',
          textAlign: 'center',
          position: 'absolute',
          left: '0px',
          top: '88px'
        }}>
            Partner Portal
          </span>
        </header>

        {/* Welcome Section */}
        <section style={{
        width: '375px',
        height: '116px',
        position: 'absolute',
        left: '0px',
        top: '124px'
      }}>
          <h1 style={{
          ...baseTextStyles,
          margin: 0,
          fontSize: '24px',
          fontWeight: 700,
          color: 'rgba(17, 24, 39, 1)',
          position: 'absolute',
          left: '24px',
          top: '24px'
        }}>
            Welcome Back
          </h1>
          <p style={{
          ...baseTextStyles,
          margin: 0,
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(75, 85, 99, 1)',
          position: 'absolute',
          left: '24px',
          top: '65px'
        }}>
            Sign in to manage your business
          </p>
        </section>

        {/* Role Selector */}
        <section style={{
        width: '375px',
        height: '54px',
        position: 'absolute',
        left: '0px',
        top: '240px'
      }}>
          <div style={{
          width: '327px',
          height: '54px',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid rgba(243, 244, 246, 1)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          position: 'absolute',
          left: '24px',
          top: '0px',
          display: 'flex',
          padding: '5px'
        }}>
            <button onClick={() => handleRoleToggle('driver')} style={{
            flex: 1,
            height: '44px',
            backgroundColor: role === 'driver' ? 'rgba(13, 148, 136, 1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/5d066938-d626-4498-be8f-704ff41e2303.svg" alt="" style={{
              width: '17.5px',
              height: '14px',
              marginRight: '6px',
              filter: role === 'driver' ? 'brightness(0) invert(1)' : 'none'
            }} />
              <span style={{
              ...baseTextStyles,
              fontSize: '14px',
              fontWeight: 500,
              color: role === 'driver' ? '#fff' : 'rgba(75, 85, 99, 1)'
            }}>Driver</span>
            </button>
            <button onClick={() => handleRoleToggle('restaurant')} style={{
            flex: 1,
            height: '44px',
            backgroundColor: role === 'restaurant' ? 'rgba(13, 148, 136, 1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/e296196c-a53d-47a6-9cc9-6f916cf5cc60.svg" alt="" style={{
              width: '15.75px',
              height: '14px',
              marginRight: '6px',
              filter: role === 'restaurant' ? 'brightness(0) invert(1)' : 'none'
            }} />
              <span style={{
              ...baseTextStyles,
              fontSize: '14px',
              fontWeight: 500,
              color: role === 'restaurant' ? '#fff' : 'rgba(75, 85, 99, 1)'
            }}>Restaurant</span>
            </button>
          </div>
        </section>

        {/* Login Form */}
        <section style={{
        width: '375px',
        height: '292px',
        position: 'absolute',
        left: '0px',
        top: '318px'
      }}>
          <form onSubmit={handleSubmit} style={{
          width: '327px',
          height: '292px',
          position: 'absolute',
          left: '24px',
          top: '0px'
        }}>
            {/* Email/Phone Field */}
            <div style={{
            width: '327px',
            height: '84px',
            position: 'absolute',
            top: '0px'
          }}>
              <label style={{
              ...baseTextStyles,
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(55, 65, 81, 1)',
              marginBottom: '8px'
            }}>
                Email or Phone
              </label>
              <div style={{
              position: 'relative'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/82ab65b9-bea9-4ceb-8899-d61bc20fe8b9.svg" alt="" style={{
                position: 'absolute',
                left: '16px',
                top: '20px',
                width: '16px',
                height: '16px',
                zIndex: 5
              }} />
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email or phone number" style={{
                ...baseTextStyles,
                width: '327px',
                height: '56px',
                backgroundColor: '#fff',
                border: '1px solid rgba(229, 231, 235, 1)',
                borderRadius: '12px',
                padding: '0 16px 0 48px',
                fontSize: '16px',
                color: 'rgba(17, 24, 39, 1)',
                outline: 'none',
                boxSizing: 'border-box'
              }} />
              </div>
            </div>

            {/* Password Field */}
            <div style={{
            width: '327px',
            height: '84px',
            position: 'absolute',
            top: '100px'
          }}>
              <label style={{
              ...baseTextStyles,
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(55, 65, 81, 1)',
              marginBottom: '8px'
            }}>
                Password
              </label>
              <div style={{
              position: 'relative'
            }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/826e5fb3-72e8-4572-bdbb-bc4a2735ff65.svg" alt="" style={{
                position: 'absolute',
                left: '16px',
                top: '20px',
                width: '14px',
                height: '16px',
                zIndex: 5
              }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{
                ...baseTextStyles,
                width: '327px',
                height: '56px',
                backgroundColor: '#fff',
                border: '1px solid rgba(229, 231, 235, 1)',
                borderRadius: '12px',
                padding: '0 48px 0 48px',
                fontSize: '16px',
                color: 'rgba(17, 24, 39, 1)',
                outline: 'none',
                boxSizing: 'border-box'
              }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/6301f665-9a89-4114-9320-37e921a24990.svg" alt="Toggle password" style={{
                  width: '18px',
                  height: '16px'
                }} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
            width: '327px',
            height: '20px',
            position: 'absolute',
            top: '200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
              <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{
                width: '16px',
                height: '16px',
                marginRight: '8px',
                cursor: 'pointer',
                accentColor: 'rgba(13, 148, 136, 1)'
              }} />
                <span style={{
                ...baseTextStyles,
                fontSize: '14px',
                color: 'rgba(75, 85, 99, 1)'
              }}>Remember me</span>
              </label>
              <button type="button" onClick={onForgotPassword} style={{
              ...baseTextStyles,
              background: 'none',
              border: 'none',
              color: 'rgba(249, 115, 22, 1)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button type="submit" style={{
            width: '327px',
            height: '56px',
            backgroundColor: 'rgba(13, 148, 136, 1)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'absolute',
            top: '236px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/8363ce57-913b-4f18-a97e-b9db90fc6331.svg" alt="" style={{
              width: '16px',
              height: '16px',
              marginRight: '8px'
            }} />
              <span style={{
              ...baseTextStyles,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff'
            }}>Sign In</span>
            </button>
          </form>
        </section>

        {/* Separator */}
        <section style={{
        width: '375px',
        height: '20px',
        position: 'absolute',
        top: '634px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
          <div style={{
          width: '327px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
            <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(229, 231, 235, 1)'
          }} />
            <span style={{
            ...baseTextStyles,
            fontSize: '14px',
            color: 'rgba(107, 114, 128, 1)'
          }}>or continue with</span>
            <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(229, 231, 235, 1)'
          }} />
          </div>
        </section>

        {/* Social Buttons */}
        <section style={{
        width: '375px',
        height: '56px',
        position: 'absolute',
        top: '678px'
      }}>
          <div style={{
          width: '327px',
          height: '56px',
          position: 'absolute',
          left: '24px',
          display: 'flex',
          gap: '12px'
        }}>
            <button type="button" onClick={() => onSocialLogin?.('google')} style={{
            flex: 1,
            height: '56px',
            backgroundColor: '#fff',
            border: '1px solid rgba(229, 231, 235, 1)',
            borderRadius: '12px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/1ed71311-8eb6-48d5-ba4f-b230b63b11b9.svg" alt="" style={{
              width: '17.15px',
              height: '18px',
              marginRight: '8px'
            }} />
              <span style={{
              ...baseTextStyles,
              fontSize: '16px',
              fontWeight: 500,
              color: 'rgba(55, 65, 81, 1)'
            }}>Google</span>
            </button>
            <button type="button" onClick={() => onSocialLogin?.('facebook')} style={{
            flex: 1,
            height: '56px',
            backgroundColor: '#fff',
            border: '1px solid rgba(229, 231, 235, 1)',
            borderRadius: '12px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/9c036377-eaa2-4e3f-ac70-efec31bd54eb.svg" alt="" style={{
              width: '18px',
              height: '18px',
              marginRight: '8px'
            }} />
              <span style={{
              ...baseTextStyles,
              fontSize: '16px',
              fontWeight: 500,
              color: 'rgba(55, 65, 81, 1)'
            }}>Facebook</span>
            </button>
          </div>
        </section>

        {/* Security Info */}
        <section style={{
        width: '375px',
        height: '116.5px',
        position: 'absolute',
        top: '758px'
      }}>
          <div style={{
          width: '327px',
          height: '116.5px',
          backgroundColor: 'rgba(13, 148, 136, 0.05)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          borderRadius: '12px',
          position: 'absolute',
          left: '24px',
          padding: '19px 17px'
        }}>
            <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            float: 'left',
            marginRight: '12px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/3b93df32-f4b6-492a-823f-312f85d77822.svg" alt="" style={{
              width: '14px',
              height: '14px'
            }} />
            </div>
            <div style={{
            float: 'left',
            width: '249px'
          }}>
              <h4 style={{
              ...baseTextStyles,
              margin: '0 0 6px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(17, 24, 39, 1)'
            }}>Secure Sign In</h4>
              <p style={{
              ...baseTextStyles,
              margin: 0,
              fontSize: '12px',
              fontWeight: 400,
              color: 'rgba(75, 85, 99, 1)',
              lineHeight: '20px',
              whiteSpace: 'pre-line'
            }}>
                Your credentials are encrypted and protected. We never share your information.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Link */}
        <section style={{
        width: '375px',
        height: '52px',
        position: 'absolute',
        top: '898.5px',
        display: 'flex',
        justifyContent: 'center'
      }}>
          <div style={{
          ...baseTextStyles,
          fontSize: '14px'
        }}>
            <span style={{
            color: 'rgba(75, 85, 99, 1)'
          }}>Don't have a partner account? </span>
            <button type="button" onClick={onSignUp} style={{
            ...baseTextStyles,
            background: 'none',
            border: 'none',
            color: 'rgba(249, 115, 22, 1)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0 4px'
          }}>
              Sign Up
            </button>
          </div>
        </section>

        {/* Help Center */}
        <section style={{
        width: '375px',
        height: '106px',
        position: 'absolute',
        top: '950.5px'
      }}>
          <button type="button" style={{
          width: '327px',
          height: '74px',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid rgba(243, 244, 246, 1)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          position: 'absolute',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 17px',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
            <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/d0b00952-dab8-45df-bb4c-5e65752f8d76.svg" alt="" style={{
              width: '16px',
              height: '16px'
            }} />
            </div>
            <div style={{
            flex: 1
          }}>
              <div style={{
              ...baseTextStyles,
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(17, 24, 39, 1)'
            }}>Need Help?</div>
              <div style={{
              ...baseTextStyles,
              fontSize: '12px',
              color: 'rgba(75, 85, 99, 1)'
            }}>Contact partner support</div>
            </div>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/bf70e7b3-35f8-4b2e-a1cd-634e095ab211.svg" alt="" style={{
            width: '10px',
            height: '16px'
          }} />
          </button>
        </section>
      </main>
    </div>;
};
