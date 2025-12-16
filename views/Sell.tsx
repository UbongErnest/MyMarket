
import React, { useState, useRef } from 'react';
import { Camera, ChevronLeft, Sparkles, Loader2, Upload, X, AlertCircle, Wand2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { generateProductDescription } from '../services/geminiService';
import { Condition, Product, User } from '../types';
// Removed Firebase Storage imports
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

export const SellView: React.FC<{ onBack: () => void; currentUser: User }> = ({ onBack, currentUser }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [posting, setPosting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    price: '',
    isNegotiable: true,
    condition: 'Used',
    description: '',
    location: currentUser.location || ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newFiles: File[] = Array.from(e.target.files);
          setImages(prev => [...prev, ...newFiles]);
          
          const newUrls = newFiles.map(file => URL.createObjectURL(file));
          setPreviewUrls(prev => [...prev, ...newUrls]);
      }
  };

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) {
      alert("Please enter a title and category first!");
      return;
    }
    setLoadingAI(true);
    
    // Use the user's current draft as the "features" input, or a default string if empty.
    const userNotes = formData.description.trim().length > 0 
        ? formData.description 
        : "Reliable, good condition, priced to sell. Perfect for students.";

    const desc = await generateProductDescription(
        formData.title, 
        formData.category, 
        formData.condition,
        userNotes
    );
    
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handlePost = async () => {
      if (!formData.title || !formData.price || !formData.category) {
          alert("Please fill in required fields");
          return;
      }
      const parsedPrice = parseFloat(formData.price);
      if (isNaN(parsedPrice)) {
          alert("Please enter a valid price.");
          return;
      }

      if (images.length === 0) {
          alert("Please upload at least one image");
          return;
      }

      setPosting(true);
      setStatusText('Preparing upload...');
      
      try {
          // 1. Upload Images to Cloudinary
          const imageUrls: string[] = [];
          
          for (let i = 0; i < images.length; i++) {
              const image = images[i];
              setStatusText(`Uploading photo ${i + 1} of ${images.length}...`);
              
              // Use Cloudinary Service
              const url = await uploadImageToCloudinary(image);
              imageUrls.push(url);
          }

          setStatusText('Finalizing listing...');

          // 2. Save Product to Firestore
          const newProduct: Omit<Product, 'id'> = {
              title: formData.title,
              price: parsedPrice,
              currency: '₦',
              category: formData.category,
              condition: formData.condition as Condition,
              description: formData.description || 'No description provided.',
              images: imageUrls,
              location: formData.location || 'Campus',
              postedDate: new Date().toISOString(), // Store as ISO string
              seller: currentUser,
              views: 0,
              isFeatured: false,
              isNegotiable: formData.isNegotiable,
              status: 'active'
          };

          await addDoc(collection(db, "products"), newProduct);
          onBack();

      } catch (error: any) {
          console.error("Error posting ad:", error);
          alert(`Failed to post ad: ${error.message || "Unknown error"}`);
      } finally {
          setPosting(false);
          setStatusText('');
      }
  }

  const hasDescription = formData.description.length > 0;

  return (
    <div className="bg-slate-950 min-h-screen pb-24 text-slate-200">
        {/* Header */}
        <div className="bg-slate-900/80 p-4 sticky top-0 z-30 flex items-center border-b border-white/5 backdrop-blur-md">
            <button onClick={onBack} disabled={posting} className="mr-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 disabled:opacity-50"><ChevronLeft size={24} /></button>
            <h1 className="text-lg font-bold text-white">Post an Ad</h1>
        </div>

        <div className="p-5 max-w-lg mx-auto">
            
            {/* Image Upload */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Photos ({images.length}/10)</label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={posting}
                        className="w-28 h-28 bg-slate-900/50 border-2 border-dashed border-purple-500/50 rounded-2xl flex flex-col items-center justify-center text-purple-500 shrink-0 cursor-pointer hover:bg-purple-500/10 transition-colors group disabled:opacity-50"
                    >
                        <Camera size={28} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold mt-2">Add Photo</span>
                    </button>
                    
                    {previewUrls.map((url, idx) => (
                        <div key={idx} className="w-28 h-28 relative shrink-0">
                            <img src={url} className="w-full h-full object-cover rounded-2xl border border-slate-700" alt="Preview" />
                            <button 
                                onClick={() => removeImage(idx)} 
                                disabled={posting}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md disabled:hidden"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 ml-1">First picture is the title picture.</p>
            </div>

            <div className="space-y-6">
                 {/* Category */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                        <select 
                            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none text-slate-200 text-sm font-medium"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            disabled={posting}
                        >
                            <option value="" className="bg-slate-900 text-slate-200">Select Category</option>
                            {CATEGORIES.map(c => <option key={c.id} value={c.name} className="bg-slate-900 text-slate-200">{c.name}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Calculus Textbook, iPhone 12" 
                        className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 placeholder-slate-600 transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        disabled={posting}
                    />
                </div>

                {/* Price & Price Type */}
                <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₦)</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 placeholder-slate-600"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            disabled={posting}
                        />
                    </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Type</label>
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 h-[58px]">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, isNegotiable: false})}
                                className={`flex-1 rounded-lg text-xs font-bold transition-all ${!formData.isNegotiable ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Fixed
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, isNegotiable: true})}
                                className={`flex-1 rounded-lg text-xs font-bold transition-all ${formData.isNegotiable ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Negotiable
                            </button>
                        </div>
                    </div>
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</label>
                    <div className="relative">
                        <select 
                            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-slate-200 text-sm font-medium"
                            value={formData.condition}
                            onChange={(e) => setFormData({...formData, condition: e.target.value})}
                            disabled={posting}
                        >
                            <option className="bg-slate-900 text-slate-200">Used</option>
                            <option className="bg-slate-900 text-slate-200">New</option>
                            <option className="bg-slate-900 text-slate-200">Refurbished</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Description with AI */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <button 
                            onClick={handleGenerateDescription}
                            disabled={loadingAI || posting}
                            className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-bold transition-all border shadow-sm ${
                                loadingAI 
                                ? 'bg-slate-800 text-slate-400 border-slate-700' 
                                : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30 hover:from-purple-500/30 hover:to-indigo-500/30 hover:shadow-purple-500/10'
                            }`}
                        >
                            {loadingAI ? <Loader2 size={10} className="animate-spin" /> : (hasDescription ? <Wand2 size={10} /> : <Sparkles size={10} />)}
                            {loadingAI ? 'WRITING...' : (hasDescription ? 'ENHANCE WITH AI' : 'AI GENERATE')}
                        </button>
                    </div>
                    <textarea 
                        rows={5}
                        placeholder="Type some notes (e.g. 'works perfectly, includes charger') and tap AI ENHANCE..." 
                        className={`w-full p-4 bg-slate-900/50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all ${loadingAI ? 'border-purple-500/50 animate-pulse' : 'border-slate-700'}`}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        disabled={posting || loadingAI}
                    ></textarea>
                </div>

                 {/* Location */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Unilag Hostel A, Engineering Faculty" 
                        className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-200 placeholder-slate-600"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        disabled={posting}
                    />
                </div>
            </div>

            <div className="mt-10">
                <button 
                    onClick={handlePost}
                    disabled={posting}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                    {posting ? (
                        <>
                            <Loader2 className="animate-spin" /> 
                            <span className="text-sm font-medium">{statusText}</span>
                        </>
                    ) : 'Post Ad'}
                </button>
                <p className="text-center text-xs text-slate-500 mt-4">
                    By posting, you agree to our Terms and Conditions.
                </p>
            </div>
        </div>
    </div>
  );
};
