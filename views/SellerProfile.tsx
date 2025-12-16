
import React from 'react';
import { User, Product } from '../types';
import { MapPin, ShieldCheck, ChevronLeft, Calendar, Building, BookOpen, Info, Phone } from 'lucide-react';
import { ProductCard } from './Home';

interface SellerProfileProps {
  seller: User;
  products: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

export const SellerProfileView: React.FC<SellerProfileProps> = ({ seller, products, onBack, onProductClick }) => {
  // Filter products for this seller (Active only)
  const sellerProducts = products.filter(p => p.seller.id === seller.id && (p.status === 'active' || !p.status)).slice().reverse();

  return (
    <div className="min-h-screen bg-slate-950 pb-10">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-30 flex items-center border-b border-white/5">
        <button onClick={onBack} className="mr-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">Seller Profile</h1>
      </div>

      {/* Profile Info */}
      <div className="p-6 text-center">
        <div className="relative inline-block mb-4">
            <img src={seller.avatar || 'https://via.placeholder.com/150'} alt={seller.name} className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-xl" />
            {seller.isVerified && (
                <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-slate-950">
                    <ShieldCheck size={18} />
                </div>
            )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{seller.name}</h2>
        {seller.university && (
            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold border border-purple-500/20 mb-3">
                {seller.university}
            </span>
        )}
        
        <div className="flex justify-center gap-6 text-sm text-slate-400 mb-6">
            <div className="flex items-center gap-1">
                <MapPin size={14} /> {seller.location || 'Campus'}
            </div>
            <div className="flex items-center gap-1">
                <Calendar size={14} /> Joined {seller.joinedDate}
            </div>
        </div>

        {/* Detailed Info (Registration Details) */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-white/5 text-left space-y-4 mb-6 shadow-inner bg-opacity-50">
            {/* Phone Number */}
            {seller.phone && (
                <div className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Phone Contact</p>
                        <p className="text-sm text-slate-200 font-mono tracking-wide selection:bg-green-500/30">
                            {seller.phone}
                        </p>
                    </div>
                </div>
            )}

            {/* Department */}
            {seller.department && (
                <div className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                         <BookOpen size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Department</p>
                        <p className="text-sm text-slate-200">{seller.department}</p>
                    </div>
                </div>
            )}

            {/* Bio */}
            {seller.bio && (
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Info size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">About Seller</p>
                        <p className="text-sm text-slate-300 italic leading-relaxed">"{seller.bio}"</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Seller's Ads */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-200 font-bold text-lg pl-1">Active Ads</h3>
            <span className="text-purple-400 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded">{sellerProducts.length} Active</span>
        </div>
        {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {sellerProducts.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
                ))}
            </div>
        ) : (
            <div className="text-center text-slate-500 py-10 bg-slate-900/30 rounded-2xl border border-white/5">
                <p>No active listings found.</p>
            </div>
        )}
      </div>
    </div>
  );
};
