
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Product } from '../types';
import { MapPin, Heart, ArrowLeft, Sparkles, Zap, TrendingUp, Filter, Search } from 'lucide-react';

interface HomeProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  searchQuery: string;
}

export const HomeView: React.FC<HomeProps> = ({ products, onProductClick, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);

  // Filter products based on active products only
  const activeProducts = products.filter(p => p.status === 'active' || !p.status);

  // --- Render Search Results View ---
  if (searchQuery) {
      const searchResults = activeProducts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        <div className="pt-24 pb-24 min-h-screen bg-slate-950 relative">
             <div className="fixed top-0 left-0 right-0 h-64 bg-purple-900/20 blur-[100px] pointer-events-none" />
             
             <div className="px-5 mb-6 flex items-center gap-2 relative z-10 pt-4">
                 <div className="p-2 bg-purple-500/10 rounded-full text-purple-400">
                    <Search size={20} />
                 </div>
                 <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Search Results</p>
                      <h2 className="text-xl font-bold text-white">"{searchQuery}"</h2>
                 </div>
             </div>
             
             <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10 relative z-10">
                  {searchResults.length > 0 ? (
                      searchResults.map(product => (
                          <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
                      ))
                  ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                              <Search size={30} opacity={0.5} />
                          </div>
                          <p>No products found matching "{searchQuery}".</p>
                      </div>
                  )}
             </div>
        </div>
      )
  }

  // Filter by category if selected
  const categoryProducts = selectedCategory 
    ? activeProducts.filter(p => p.category === selectedCategory).reverse()
    : [];

  // Recent products (All recent products sorted by date)
  const allRecentProducts = [...activeProducts].reverse();
  
  // Products to display in "Fresh on Campus" (First 4 or All)
  const displayedRecentProducts = showAllRecent ? allRecentProducts : allRecentProducts.slice(0, 10); // Show more by default for scroll

  // --- Render Category View ---
  if (selectedCategory) {
      return (
          <div className="pt-24 pb-24 min-h-screen bg-slate-950 relative">
               {/* Background Glow */}
               <div className="fixed top-0 left-0 right-0 h-64 bg-purple-900/20 blur-[100px] pointer-events-none" />
               
               <div className="px-5 mb-6 flex items-center gap-4 relative z-10 pt-4">
                   <button onClick={() => setSelectedCategory(null)} className="p-3 bg-slate-800/80 backdrop-blur-md rounded-full text-slate-200 hover:bg-white/10 hover:text-white transition-all shadow-lg border border-white/5">
                       <ArrowLeft size={22} />
                   </button>
                   <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Category</p>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{selectedCategory}</h2>
                   </div>
               </div>
               
               <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10 relative z-10">
                    {categoryProducts.length > 0 ? (
                        categoryProducts.map(product => (
                            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                <Filter size={30} opacity={0.5} />
                            </div>
                            <p>No products found in this category.</p>
                        </div>
                    )}
               </div>
          </div>
      )
  }

  // --- Render All Recent View ---
  if (showAllRecent) {
      return (
        <div className="pt-24 pb-24 min-h-screen bg-slate-950 relative">
            <div className="px-5 mb-6 flex items-center gap-4 relative z-10 pt-4">
                <button onClick={() => setShowAllRecent(false)} className="p-3 bg-slate-800/80 backdrop-blur-md rounded-full text-slate-200 hover:bg-white/10 hover:text-white transition-all shadow-lg border border-white/5">
                    <ArrowLeft size={22} />
                </button>
                <h2 className="text-2xl font-bold text-white">All Recent Ads</h2>
            </div>
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
                {allRecentProducts.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
                ))}
            </div>
        </div>
      )
  }

  // --- Render Main Home View ---
  return (
    <div className="pb-28 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-[-20%] w-[80%] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="px-5 mt-10 mb-8 relative z-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-900 to-slate-900 p-6 shadow-2xl shadow-purple-900/10 border border-white/5 group">
            {/* Abstract Shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-purple-300 border border-white/5 flex items-center gap-1">
                        <Sparkles size={10} className="text-yellow-400" /> CAMPUS MARKETPLACE
                    </span>
                </div>
                <h1 className="text-2xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                    Buy & Sell on <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-200">Your Campus</span>
                </h1>
                <p className="text-slate-400 text-xs mb-5 max-w-[85%] font-medium leading-relaxed">
                    The safest way to find textbooks, gadgets, and more from students near you.
                </p>
                <button 
                    onClick={() => setShowAllRecent(true)}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-purple-500/25 hover:bg-purple-500 transition-all active:scale-95 flex items-center gap-2"
                >
                    Start Exploring <Zap size={14} fill="currentColor" />
                </button>
            </div>
            
            {/* decorative image/icon */}
            <div className="absolute bottom-4 right-4 text-white/5 transform rotate-12 scale-[2]">
                <TrendingUp size={64} />
            </div>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="mb-8 pl-5 relative z-10">
        <div className="flex items-center justify-between pr-5 mb-4">
             <h3 className="text-white font-bold text-lg tracking-tight">Browse Categories</h3>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pr-5 snap-x">
          {CATEGORIES.map((cat, idx) => (
            <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.name)}
                className="snap-start shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-purple-500/50 hover:bg-slate-800 transition-all group shadow active:scale-95"
            >
              <div className="text-slate-400 group-hover:text-purple-400 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured/Recent Section */}
      <div className="px-5 relative z-10">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
                Fresh Ads <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </h2>
            <p className="text-slate-500 text-xs">Latest items added today</p>
          </div>
          <span 
            onClick={() => setShowAllRecent(true)}
            className="text-purple-400 text-xs font-bold cursor-pointer hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-1 rounded-lg"
          >
            See All
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {displayedRecentProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
            ))}
        </div>
        
        <div className="mt-10 text-center pb-8">
             <button 
                onClick={() => setShowAllRecent(true)}
                className="text-slate-400 text-xs font-bold border border-slate-800 bg-slate-900/50 px-8 py-3 rounded-full hover:bg-slate-800 hover:text-white transition-all hover:border-slate-700"
             >
                 Load More Products
             </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => (
    <div onClick={onClick} className="group relative flex flex-col cursor-pointer active:scale-[0.98] transition-transform duration-300">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-800 shadow-lg shadow-black/20 border border-white/5 group-hover:border-purple-500/30 transition-colors">
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
            
            {/* Tags */}
            {product.isFeatured && (
                <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                    Featured
                </span>
            )}
            
            {/* Price Tag (Floating) */}
            <div className="absolute bottom-2 left-2 right-2">
                <div className="glass px-3 py-2 rounded-xl border-white/10 backdrop-blur-md flex items-center justify-between">
                     <p className="text-white font-extrabold text-sm tracking-tight">
                        {product.currency}{product.price.toLocaleString()}
                    </p>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-purple-600 hover:text-white transition-colors">
                         <Heart size={12} />
                    </div>
                </div>
            </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
            <h3 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-purple-400 transition-colors leading-tight">
                {product.title}
            </h3>
            <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center text-slate-500 text-[10px] gap-1 font-medium">
                    <MapPin size={10} />
                    <span className="line-clamp-1 max-w-[80px]">{product.location}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{product.condition}</span>
            </div>
        </div>
    </div>
);
