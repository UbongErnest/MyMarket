
import React, { useState } from 'react';
import { Settings, LogOut, Package, ShieldCheck, ChevronLeft, Camera, Edit2, Save, X, Moon, Sun, Loader2, Trash2, CheckCircle, Download } from 'lucide-react';
import { User, Product } from '../types';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

interface ProfileViewProps {
    currentUser: User;
    userProducts: Product[];
    onUpdateUser: (updatedUser: User) => void;
    onUpdateProductStatus: (productId: string, status: 'sold' | 'deleted') => void;
    onLogout: () => void;
    onBack: () => void;
    onInstallApp: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, userProducts, onUpdateUser, onUpdateProductStatus, onLogout, onBack, onInstallApp }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'my-ads' | 'settings'>('details');
  const [editForm, setEditForm] = useState(currentUser);
  const [darkMode, setDarkMode] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter My Ads (Active and Sold) - Filter out deleted if cached locally
  const myAds = userProducts.filter(p => p.seller.id === currentUser.id).slice().reverse();

  const handleSave = () => {
      onUpdateUser(editForm);
      setIsEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadingAvatar(true);
          try {
              const url = await uploadImageToCloudinary(file);
              setEditForm(prev => ({ ...prev, avatar: url }));
              
              // If not in full edit mode, update profile immediately
              if (!isEditing) {
                  onUpdateUser({ ...currentUser, avatar: url });
              }
          } catch (error) {
              console.error("Failed to upload avatar", error);
              alert("Failed to upload image");
          } finally {
              setUploadingAvatar(false);
          }
      }
  };

  const renderDetails = () => (
      <div className="space-y-4 px-5 mt-4">
          <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Details</h2>
              {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-purple-400 text-xs font-bold flex items-center gap-1">
                      <Edit2 size={12} /> Edit
                  </button>
              )}
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
             {isEditing ? (
                 <>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Full Name</label>
                        <input className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Bio</label>
                        <textarea rows={2} className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Phone</label>
                        <input className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">University</label>
                        <input className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.university} onChange={e => setEditForm({...editForm, university: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Department</label>
                        <input className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Residence</label>
                        <input className="w-full bg-slate-800 p-2 rounded text-slate-200 text-sm" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-1"><Save size={14} /> Save</button>
                        <button onClick={() => { setIsEditing(false); setEditForm(currentUser); }} className="flex-1 bg-slate-800 text-slate-300 font-bold py-2 rounded-lg flex justify-center items-center gap-1"><X size={14} /> Cancel</button>
                    </div>
                 </>
             ) : (
                 <>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <span className="text-xs text-slate-500 block">Email</span>
                            <span className="text-sm text-slate-300">{currentUser.email}</span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 block">Phone</span>
                            <span className="text-sm text-slate-300">{currentUser.phone || 'N/A'}</span>
                        </div>
                         <div>
                            <span className="text-xs text-slate-500 block">University / Dept</span>
                            <span className="text-sm text-slate-300">{currentUser.university} • {currentUser.department}</span>
                        </div>
                         <div>
                            <span className="text-xs text-slate-500 block">Bio</span>
                            <span className="text-sm text-slate-300 italic">"{currentUser.bio || 'No bio yet.'}"</span>
                        </div>
                    </div>
                 </>
             )}
          </div>
      </div>
  );

  const renderMyAds = () => (
      <div className="px-4 mt-4 space-y-4">
           {myAds.length === 0 ? (
               <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-white/5">
                   <p className="text-slate-500">You haven't posted any ads yet.</p>
               </div>
           ) : (
               myAds.map(ad => (
                   <div key={ad.id} className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex gap-3">
                       <img src={ad.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-800" alt={ad.title} />
                       <div className="flex-1 flex flex-col justify-between">
                           <div>
                               <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{ad.title}</h3>
                               <p className="text-purple-400 text-xs font-bold">{ad.currency}{ad.price.toLocaleString()}</p>
                           </div>
                           <div className="flex justify-between items-center mt-2">
                               {ad.status === 'sold' ? (
                                   <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
                                       <CheckCircle size={10} /> SOLD
                                   </span>
                               ) : (
                                   <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1 border border-green-500/20">
                                       ACTIVE
                                   </span>
                               )}
                               
                               <div className="flex gap-2">
                                   {ad.status !== 'sold' && (
                                       <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if(window.confirm("Mark this item as sold? It will be removed from the marketplace.")) {
                                                    setProcessingId(ad.id);
                                                    try {
                                                        await onUpdateProductStatus(ad.id, 'sold');
                                                        setProcessingId(null);
                                                    } catch (err) {
                                                        setProcessingId(null);
                                                    }
                                                }
                                            }}
                                            disabled={processingId === ad.id}
                                            className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors font-bold flex items-center gap-1 disabled:opacity-50"
                                        >
                                           {processingId === ad.id ? <Loader2 size={12} className="animate-spin"/> : 'Mark as Sold'}
                                       </button>
                                   )}
                               </div>
                           </div>
                       </div>
                   </div>
               ))
           )}
      </div>
  );

  const renderSettings = () => (
      <div className="px-5 mt-4 space-y-3">
          {/* Install App Button */}
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 rounded-2xl flex items-center justify-between border border-purple-500/20">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-500/30">
                       <Download size={18} />
                   </div>
                   <div>
                       <span className="text-white text-sm font-bold block">Install Mobile App</span>
                       <span className="text-purple-300 text-[10px]">Add to your home screen</span>
                   </div>
               </div>
               <button 
                onClick={onInstallApp}
                className="bg-white text-purple-900 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-purple-50 transition-colors"
               >
                   Install
               </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-800">
               <div className="flex items-center gap-3">
                   {darkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
                   <span className="text-slate-200 text-sm font-medium">Dark Mode</span>
               </div>
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-purple-600' : 'bg-slate-700'}`}
               >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
        {/* Header Profile */}
        <div className="bg-gradient-to-b from-purple-700 to-indigo-900 text-white pt-6 pb-20 px-5 rounded-b-[2.5rem] relative shadow-2xl shadow-purple-900/20">
             {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                 <button onClick={onBack} className="text-white bg-black/20 p-2 rounded-full hover:bg-black/30 transition-colors backdrop-blur-sm">
                    <ChevronLeft size={24} />
                </button>
            </div>
            {/* Logout Button */}
            <div className="absolute top-4 right-4 z-20">
                 <button onClick={onLogout} className="text-red-100 bg-red-500/20 p-2 rounded-full hover:bg-red-500/30 transition-colors backdrop-blur-sm border border-red-500/30">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="flex flex-col items-center mt-6">
                <div className="relative group">
                     {/* Avatar Image or Loader */}
                    {uploadingAvatar ? (
                        <div className="w-28 h-28 rounded-full border-4 border-purple-400/30 bg-slate-800 flex items-center justify-center">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                        </div>
                    ) : (
                        <img src={currentUser.avatar || "https://via.placeholder.com/150"} className="w-28 h-28 rounded-full border-4 border-purple-400/30 object-cover bg-slate-800" alt="Profile" />
                    )}
                    
                    <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full border border-slate-700 cursor-pointer hover:bg-purple-600 transition-colors">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                    {currentUser.isVerified && (
                         <div className="absolute top-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-4 border-purple-800">
                             <ShieldCheck size={14} />
                        </div>
                    )}
                </div>
                <h1 className="text-2xl font-bold mt-3">{currentUser.name}</h1>
                <p className="text-purple-100 text-sm opacity-90">
                    {currentUser.university}
                </p>
                <div className="mt-2 inline-block bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm border border-white/20">
                    Verified Student
                </div>
            </div>
        </div>

        {/* Tab Menu */}
        <div className="flex justify-center -mt-8 px-4 relative z-10">
            <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-800 flex shadow-xl shadow-black/50">
                <button 
                    onClick={() => setActiveTab('details')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'details' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    My Details
                </button>
                <button 
                    onClick={() => setActiveTab('my-ads')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'my-ads' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Package size={14} /> My Ads
                </button>
                <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'settings' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   <Settings size={14} /> Settings
                </button>
            </div>
        </div>

        {activeTab === 'details' && renderDetails()}
        {activeTab === 'my-ads' && renderMyAds()}
        {activeTab === 'settings' && renderSettings()}

    </div>
  );
};
