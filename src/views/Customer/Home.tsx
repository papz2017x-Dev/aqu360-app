import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import type { Product } from '../../store/Store';
import { Search, Plus } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, addToCart } = useStore();
  const navigate = useNavigate();
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
    <div className="animate-slide-up">
      {/* Toast Notification */}
      {showAddedToast && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          zIndex: 1000,
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          Item added to cart!
        </div>
      )}

      {/* Hero Header matching the image */}
      <div className="aqua-header" style={{ padding: '2rem 1.5rem 2.5rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/a360.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'white', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>Aqua360</h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontWeight: 500 }}>Fresh Water, Delivered Fast</p>
          </div>
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
                  <div className="product-price" style={{ fontSize: '1.35rem' }}>
                    ₱{product.price.toFixed(2)}
                  </div>
                  <button
                    className="add-btn"
                    style={{
                      width: '3rem',
                      height: '3rem',
                      boxShadow: '0 10px 15px -3px rgba(37, 169, 226, 0.3)',
                      borderRadius: '50%'
                    }}
                    onClick={() => handleAddToCart(product)}
                  >
                    <Plus size={22} />
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
  );
};
