import React, { useState } from 'react';
import { useStore } from '../../store/Store';
import type { Product } from '../../store/Store';
import { Search, ShoppingCart, Plus, Bell } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, addToCart, requestNotificationPermission } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddedToast, setShowAddedToast] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product.id);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  return (
    <>
      {/* Toast Notification */}
      {showAddedToast && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          zIndex: 9999,
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          Item added to cart!
        </div>
      )}
      <div className="animate-slide-up">
        {/* Hero Header matching the image */}
        <div className="aqua-header" style={{ padding: '2rem 1.5rem 2.5rem' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/a360.png"
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1.75rem',
                    color: 'white',
                    margin: 0,
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Aqua360
                </h1>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Fresh Water, Delivered Fast
                </p>
              </div>
            </div>

            <button 
              onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) alert('Notifications enabled successfully!');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer'
              }}
            >
              <Bell size={14} /> Enable Notifs
            </button>
          </div>


          <div className="search-container" style={{ marginTop: '1.5rem' }}>
            <Search size={20} className="search-icon" style={{ left: '1.25rem' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '2.5rem', borderRadius: '18px', height: '3.5rem' }}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Products</h2>

          {/* Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredProducts.map((product: Product) => (
              <div key={product.id} className="product-card" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #F3F4F6' }}>
                <div className="product-image-container" style={{ height: '160px' }}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.img-fallback')) {
                          const fallback = document.createElement('img');
                          fallback.src = '/a360.png';
                          fallback.className = 'img-fallback';
                          fallback.style.cssText = 'width:64px;opacity:0.15;';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <img src="/a360.png" alt="Placeholder" style={{ width: '64px', opacity: 0.15 }} />
                  )}
                </div>
                <div className="product-info"
                  style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: '#111827', lineHeight: '1.3' }}>
                      {product.name}
                    </h3>
                    <p className="text-muted" style={{
                      fontSize: '0.8rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.5',
                      color: 'var(--color-primary)'
                    }}>
                      {product.description}
                    </p>
                  </div>

                  {/* Bottom row: price + button inline */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="product-price" style={{ fontSize: '1rem' }}>
                      ₱{product.price.toFixed(2)}
                    </div>
                    <button
                      className="add-btn"
                      style={{
                        boxShadow: "none",
                        // remove width, height, and borderRadius
                        background: "transparent", // optional: ensures no background fill
                        border: "none",            // optional: removes default button border
                        cursor: "hand",

                      }}
                      onClick={() => handleAddToCart(product)}
                      title='Add to cart'

                    >
                      <ShoppingCart size={22} color="#25A9E2" />
                      {/* Overlayed + sign */}
                      <Plus
                        size={10}
                        style={{
                          position: "absolute",
                          color: "#25A9E2",
                        }} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center p-12">
              <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
