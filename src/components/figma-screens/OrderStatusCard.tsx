import React, { useState } from 'react';
interface OrderItem {
  name: string;
  icon: string;
  iconWidth: string;
}
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  restaurant: string;
  status: 'Delivered' | 'Cancelled';
  items: OrderItem[];
  specialNote?: string;
  price: string;
  rating?: number;
  cancellationReason?: string;
  refundAmount?: string;
}
interface OrderStatusCardProps {
  onNavigate?: (screen: string) => void;
}
export const OrderStatusCard = ({ onNavigate }: OrderStatusCardProps) => {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [activeTab, setActiveTab] = useState('Orders');
  const orders: Order[] = [{
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: 'Jan 15, 2024',
    restaurant: 'Siargao Beach Cafe',
    status: 'Delivered',
    items: [{
      name: '2x Chicken Adobo Bowl',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/517be654-7530-4b09-ae2b-683c5ad74f9a.svg',
      iconWidth: '18px'
    }, {
      name: '1x Fresh Coconut Water',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/69f4bcec-e8db-423d-82ca-da9ff5217e17.svg',
      iconWidth: '13.5px'
    }],
    specialNote: 'Special: Extra rice, no onions',
    price: '₱485.00',
    rating: 5
  }, {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: 'Jan 12, 2024',
    restaurant: 'Island Grill House',
    status: 'Delivered',
    items: [{
      name: '1x Grilled Chicken',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/cacc8238-3fbf-46c8-891a-43590d3e7150.svg',
      iconWidth: '18px'
    }, {
      name: '1x Grilled Fish',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/0a0a2104-a3db-499f-a5f8-565f4b8c7482.svg',
      iconWidth: '20.25px'
    }],
    price: '₱650.00'
  }, {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: 'Jan 10, 2024',
    restaurant: 'Tropical Bites',
    status: 'Cancelled',
    items: [{
      name: '2x Tropical Burger',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/b84f05b9-beed-4972-bbf0-a86e8f7bb5c0.svg',
      iconWidth: '18px'
    }, {
      name: '1x Hawaiian Pizza',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/65a9ab07-0579-4d9a-9d5c-da3cffdf3a23.svg',
      iconWidth: '18px'
    }],
    cancellationReason: 'Cancelled: Restaurant was temporarily closed',
    refundAmount: '₱720.00',
    price: '₱720.00'
  }, {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: 'Jan 8, 2024',
    restaurant: 'Cloud 9 Kitchen',
    status: 'Delivered',
    items: [{
      name: '1x Garlic Butter Shrimp',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/b8fa8548-7b2b-48c6-9071-e9c402c62f31.svg',
      iconWidth: '18px'
    }, {
      name: '2x Jasmine Rice',
      icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/e1ec63a8-fa83-4a56-830c-99e7875d899d.svg',
      iconWidth: '18px'
    }],
    specialNote: 'Special: Medium spicy level',
    price: '₱390.00',
    rating: 4
  }];
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'All Orders') return true;
    return order.status === activeFilter;
  });
  return <div style={{
    width: '100%',
    maxWidth: '375px',
    height: '100%',
    minHeight: '812px',
    display: 'flex',
    flexDirection: 'column',
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
      height: '72px',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderBottom: '1px solid rgba(229, 231, 235, 1)',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      zIndex: 10
    }}>
        <h1 style={{
        margin: 0,
        color: 'rgba(17, 24, 39, 1)',
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: '28px',
        letterSpacing: '-0.5px'
      }}>Order History</h1>
        <button aria-label="Filter" style={{
        width: '32px',
        height: '40px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(229, 231, 235, 1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
          <img src="https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/edd18ce4-e4a1-4f34-b33f-cc4d5b594825.svg" alt="" style={{
          width: '16px',
          height: '16px'
        }} />
        </button>
      </header>

      {/* Filter Tabs */}
      <div style={{
      width: '100%',
      height: '61px',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderBottom: '1px solid rgba(243, 244, 246, 1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      flexShrink: 0
    }}>
        <div style={{
        display: 'flex',
        gap: '4px',
        width: '100%'
      }}>
          {['All Orders', 'Delivered', 'Cancelled'].map(filter => <button key={filter} onClick={() => setActiveFilter(filter)} style={{
          flex: 1,
          height: '36px',
          backgroundColor: activeFilter === filter ? 'rgba(13, 148, 136, 1)' : 'transparent',
          border: '1px solid rgba(229, 231, 235, 1)',
          borderRadius: '8px',
          color: activeFilter === filter ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
              {filter}
            </button>)}
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '100px'
    }}>
        {filteredOrders.map(order => <div key={order.id} onClick={() => onNavigate?.('order-detail')} style={{
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        border: '1px solid rgba(229, 231, 235, 1)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: onNavigate ? 'pointer' : undefined
      }}>
            {/* Card Header */}
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
              <div>
                <div style={{
              color: 'rgba(17, 24, 39, 1)',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              letterSpacing: '-0.5px'
            }}>
                  {order.restaurant}
                </div>
                <div style={{
              color: 'rgba(107, 114, 128, 1)',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '-0.5px'
            }}>
                  #{order.orderNumber} • {order.date}
                </div>
              </div>
              <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: order.status === 'Delivered' ? 'rgba(22, 101, 52, 1)' : 'rgba(153, 27, 27, 1)',
            lineHeight: '16px'
          }}>
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
              {order.items.map((item, idx) => <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
                  <div style={{
              width: '18px',
              display: 'flex',
              justifyContent: 'center'
            }}>
                    <img src={item.icon} alt="" style={{
                width: item.iconWidth
              }} />
                  </div>
                  <span style={{
              color: 'rgba(55, 65, 81, 1)',
              fontSize: '14px',
              lineHeight: '20px'
            }}>{item.name}</span>
                </div>)}
              {order.specialNote && <div style={{
            color: 'rgba(107, 114, 128, 1)',
            fontSize: '12px',
            paddingLeft: '30px'
          }}>
                  {order.specialNote}
                </div>}
            </div>

            {/* Alert Box for Cancellation */}
            {order.cancellationReason && <div style={{
          backgroundColor: 'rgba(254, 242, 242, 1)',
          border: '1px solid rgba(254, 202, 202, 1)',
          borderRadius: '8px',
          padding: '12px',
          color: 'rgba(185, 28, 28, 1)',
          fontSize: '12px',
          lineHeight: '16px'
        }}>
                {order.cancellationReason}
              </div>}

            {/* Price & Rating */}
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
              <div style={{
            color: order.status === 'Cancelled' ? 'rgba(220, 38, 38, 1)' : 'rgba(17, 24, 39, 1)',
            fontSize: '16px',
            fontWeight: 600
          }}>
                {order.status === 'Cancelled' ? `Refund: ${order.refundAmount}` : order.price}
              </div>
              {order.rating && <div style={{
            color: 'rgba(22, 163, 74, 1)',
            fontSize: '12px'
          }}>
                  ★ You rated this order {order.rating} stars
                </div>}
            </div>

            {/* Actions */}
            <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '4px'
        }}>
              <button onClick={e => { e.stopPropagation(); onNavigate?.('restaurant'); }} style={{
            flex: order.status === 'Cancelled' ? 1 : 'none',
            width: order.status === 'Cancelled' ? 'auto' : '110px',
            height: '38px',
            backgroundColor: 'rgba(13, 148, 136, 1)',
            color: '#FFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                REORDER
              </button>
              {order.status !== 'Cancelled' && <>
                  <button onClick={e => { e.stopPropagation(); onNavigate?.('order-detail'); }} style={{
              width: '92px',
              height: '38px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(229, 231, 235, 1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    RECEIPT
                  </button>
                  <button onClick={e => { e.stopPropagation(); onNavigate?.('order-detail'); }} style={{
              width: '48px',
              height: '38px',
              backgroundColor: 'rgba(249, 115, 22, 1)',
              border: 'none',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <img src={order.id === '1' ? "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/338bf62a-4060-4d0b-a7f5-c6f289aac8b2.svg" : order.id === '2' ? "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/30649341-afcb-437b-bbd4-2e49f5e22151.svg" : "https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/df5f67b6-6cf2-428c-8d98-c8b2a32b78a6.svg"} alt="Feedback" style={{
                width: '16px'
              }} />
                  </button>
                </>}
            </div>
          </div>)}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
      width: '100%',
      height: '81px',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderTop: '1px solid rgba(229, 231, 235, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      position: 'absolute',
      bottom: 0,
      left: 0,
      zIndex: 10
    }}>
        {[{
        name: 'Home',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/c3dc0d0a-6bba-4fca-ac8e-f90336ba89d5.svg',
        width: '22.5px'
      }, {
        name: 'Orders',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/804abaa0-ea84-46f5-ab5e-15b721d0df5d.svg',
        width: '20px'
      }, {
        name: 'Account',
        icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/375282309693321216/figma-assets/af01e9f7-948a-4168-b49c-ef2c7f33dbab.svg',
        width: '17.5px'
      }].map(item => <button key={item.name} onClick={() => onNavigate ? onNavigate(item.name === 'Home' ? 'home' : item.name === 'Orders' ? 'orders' : item.name === 'Account' ? 'account' : 'home') : setActiveTab(item.name)} style={{
        backgroundColor: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        padding: '8px 0',
        width: '64px'
      }}>
            <div style={{
          height: '28px',
          display: 'flex',
          alignItems: 'center'
        }}>
              <img src={item.icon} alt="" style={{
            width: item.width,
            filter: activeTab === item.name ? 'none' : 'grayscale(1) opacity(0.5)'
          }} />
            </div>
            <span style={{
          fontSize: '12px',
          fontWeight: activeTab === item.name ? 500 : 400,
          color: activeTab === item.name ? 'rgba(13, 148, 136, 1)' : 'rgba(156, 163, 175, 1)'
        }}>{item.name}</span>
          </button>)}
      </nav>
    </div>;
};
