import React, { useState, useRef } from 'react';
import { useStore } from '../../store/Store';
import type { Product } from '../../store/Store';
import { Plus, Edit, Trash2, X, Save, Upload, Camera, ChevronLeft } from 'lucide-react';

export const ManageStock: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Omit<Product, 'id'>>({ name: '', description: '', price: 0, image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (product: Product) => {
    setIsEditing(product.id);
    setFormProduct({ name: product.name, description: product.description, price: product.price, image: product.image });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 400;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFormProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.7) }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing === 'new') await addProduct(formProduct);
      else if (isEditing) await updateProduct({ ...formProduct, id: isEditing });
      setIsEditing(null);
      setFormProduct({ name: '', description: '', price: 0, image: '' });
    } catch (err: any) {
      alert(`Failed: ${err?.message}`);
    }
  };

  return (
    <div className="animate-slide-up pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><ChevronLeft size={20} /></button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Stock Control</h2>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" style={{ borderRadius: '16px', padding: '0.6rem 1.2rem' }} onClick={() => setIsEditing('new')}>
            <Plus size={20} /> <span style={{ fontWeight: 800 }}>New Item</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="product-card mb-8 p-6" style={{ background: 'white', borderRadius: '32px', border: '2px solid var(--color-primary-light)' }}>
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-lg">{isEditing === 'new' ? 'Add Product' : 'Edit Product'}</h4>
            <button className="p-2 bg-gray-50 rounded-xl" onClick={() => setIsEditing(null)}><X size={20} /></button>
          </div>
          <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
            <input className="input" placeholder="Product Name" value={formProduct.name} onChange={e => setFormProduct({...formProduct, name: e.target.value})} required />
            <textarea className="input" placeholder="Description" value={formProduct.description} onChange={e => setFormProduct({...formProduct, description: e.target.value})} rows={2} required />
            <input className="input" type="number" placeholder="Price (₱)" value={formProduct.price || ''} onChange={e => setFormProduct({...formProduct, price: Number(e.target.value)})} required />
            
            <div className="flex flex-col gap-3">
              <input className="input" placeholder="Image URL" value={formProduct.image.startsWith('data:') ? '' : formProduct.image} onChange={e => setFormProduct({ ...formProduct, image: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline flex-1" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Upload</button>
                <button type="button" className="btn btn-outline flex-1" onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }}><Camera size={16} /> Photo</button>
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
              {formProduct.image && <img src={formProduct.image} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '16px', background: '#F9FAFB', padding: '1rem' }} />}
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '1rem', borderRadius: '18px' }}><Save size={18} /> Save Product</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product: Product) => (
          <div key={product.id} className="product-card p-4 flex items-center justify-between bg-white" style={{ borderRadius: '24px' }}>
            <div className="flex items-center gap-4">
              <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', borderRadius: '16px', overflow: 'hidden' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div className="font-bold text-gray-900">{product.name}</div>
                <div className="text-primary font-black">₱{product.price.toFixed(0)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-50 text-blue-600 rounded-xl" onClick={() => handleEditClick(product)}><Edit size={18} /></button>
              <button className="p-2 bg-red-50 text-red-600 rounded-xl" onClick={() => deleteProduct(product.id)}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
