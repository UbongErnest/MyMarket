
import React, { useState } from 'react';
import { Home, MessageSquare, Plus, User, Search, X, ShoppingBag } from 'lucide-react';
import { User as UserType } from '../types';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, unreadCount = 0 }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <Home size={22} />, isSpecial: false },
    { id: 'sell', label: 'Post', icon: <Plus size={28} />, isSpecial: true },
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={22} />, isSpecial: false },
    { id: 'profile', label: 'Profile', icon: <User size={22} />, isSpecial: false },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center">
        {/* Floating Glass Island */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-6 h-16 flex items-center justify-between gap-2 w-full max-w-[340px] relative">
            
            {/* Tabs */}
            {tabs.map((tab) => {
                const isActive = currentTab === tab.id;

                if (tab.isSpecial) {
                    return (
                        <div key={tab.id} className="relative -top-6 mx-2">
                             <button
                                onClick={() => onTabChange(tab.id)}
                                className="w-14 h-14 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 text-white rounded-full shadow-[0_4px_20px_rgba(124,58,237,0.5)] border-4 border-slate-950 flex items-center justify-center transform transition-transform active:scale-95 group"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Plus size={28} strokeWidth={3} />
                            </button>
                        </div>
                    )
                }

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {/* Active Glow Background */}
                        {isActive && (
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-sm scale-75 animate-pulse" />
                        )}
                        
                        <div className="relative z-10">
                            {tab.icon}
                            
                            {/* Unread Badge */}
                            {tab.id === 'chat' && unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-slate-900 shadow-sm animate-bounce">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </div>

                        {/* Active Indicator Dot */}
                        <div className={`absolute -bottom-1 w-1 h-1 rounded-full bg-purple-400 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    </button>
                );
            })}
        </div>
    </div>
  );
};

interface TopBarProps {
    currentUser: UserType;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentUser, searchValue, onSearchChange }) => {
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="bg-gradient-to-r from-purple-900/90 to-slate-900/90 backdrop-blur-md p-4 pb-12 sticky top-0 z-40 shadow-xl border-b border-white/5 rounded-b-[2rem]">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                    {logoError ? (
                         <div className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <ShoppingBag className="text-white w-4 h-4" />
                         </div>
                    ) : (
                        <img 
                            src="https://res.cloudinary.com/dfn83v6jq/image/upload/v1740636841/IMG-20250227-WA0001_1_m5f0k7.jpg" 
                            alt="WE Logo" 
                            className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/20 object-cover"
                            onError={() => setLogoError(true)}
                        />
                    )}
                    <h1 className="text-white text-xl font-extrabold tracking-tight">WE</h1>
                </div>
                <div className="flex gap-4 text-white">
                    <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-sm font-bold border border-white/10 overflow-hidden shadow-inner ring-2 ring-white/5">
                        {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                            "ME"
                        )}
                    </div>
                </div>
            </div>
            {/* Search Bar - Hanging */}
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-2.5 flex items-center shadow-2xl absolute -bottom-6 left-5 right-5 border border-white/10 ring-1 ring-black/20 group focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                <Search className="text-slate-400 ml-2 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search gadgets, books..." 
                    className="w-full bg-transparent border-none outline-none px-3 text-slate-200 placeholder-slate-500 text-sm font-medium"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchValue && (
                    <button 
                        onClick={() => onSearchChange('')}
                        className="p-1 bg-slate-700/50 rounded-full text-slate-400 hover:text-white mr-1"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
