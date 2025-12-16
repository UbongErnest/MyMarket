
import React, { useState } from 'react';
import { Product, User } from '../types';
import { ChevronLeft, Clock, ShieldCheck, MessageSquare, MapPin, CheckCircle, Camera, Flag } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface ProductDetailProps {
  product: Product;
  currentUser: User | null; // Allow null for safety checks
  onBack: () => void;
  onChat: (chatId: string) => void;
  onViewSeller: (seller: User) => void;
}

export const ProductDetailView: React.FC<ProductDetailProps> = ({ product, currentUser, onBack, onChat, onViewSeller }) => {
  const [startingChat, setStartingChat] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;
      const width = e.currentTarget.clientWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentImageIndex(index);
  };

  const handleReport = () => {
      const subject = "Report Product from We App";
      const body = `I would like to report the following product:

Product Name: ${product.title}
Category: ${product.category}
Seller Name: ${product.seller.name}
Product ID: ${product.id}

Reason for report: `;
      
      window.location.href = `mailto:ubongudoekpoernest@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleStartChat = async () => {
    if (!currentUser) {
        alert("Please login to chat with the seller.");
        return;
    }
    
    if (currentUser.id === product.seller.id) {
        alert("You cannot chat with yourself.");
        return;
    }

    setStartingChat(true);

    try {
        // Strategy: Deterministic ID to prevent duplicate chats
        const sortedIds = [currentUser.id, product.seller.id].sort();
        // Sanitize product ID to be safe for document paths
        const safeProductId = product.id.replace(/[^a-zA-Z0-9]/g, "_"); 
        const chatId = `${sortedIds[0]}_${sortedIds[1]}_${safeProductId}`;
        
        console.log("Attempting to access chat:", chatId);

        const chatDocRef = doc(db, "conversations", chatId);
        
        let chatExists = false;

        try {
            const chatSnap = await getDoc(chatDocRef);
            chatExists = chatSnap.exists();
        } catch (readError: any) {
            // Handle permission denied if document doesn't exist yet (common in Firestore security rules)
            if (readError.code === 'permission-denied') {
                chatExists = false;
            } else {
                console.error("Error reading chat doc:", readError);
            }
        }

        if (!chatExists) {
            // Create new conversation
            const conversationData = {
                participants: [currentUser.id, product.seller.id],
                participantDetails: {
                    [currentUser.id]: {
                        name: currentUser.name,
                        avatar: currentUser.avatar || '',
                        university: currentUser.university || ''
                    },
                    [product.seller.id]: {
                        name: product.seller.name,
                        avatar: product.seller.avatar || '',
                        university: product.seller.university || ''
                    }
                },
                productId: product.id,
                productTitle: product.title,
                productPrice: product.price,
                productImage: product.images[0] || '',
                lastMessage: '',
                lastMessageTime: serverTimestamp(),
                unreadCounts: {
                    [currentUser.id]: 0,
                    [product.seller.id]: 0
                },
                createdAt: serverTimestamp()
            };
            
            await setDoc(chatDocRef, conversationData);
        }

        onChat(chatId);

    } catch (error: any) {
        console.error("Error starting chat:", error);
        alert(`Failed to start chat: ${error.message}`);
    } finally {
        setStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 relative">
        {/* Full Screen Image Slider */}
        <div className="relative h-[45vh] bg-slate-900 group">
             {/* Scrollable Container */}
             <div 
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                onScroll={handleScroll}
             >
                {product.images.map((img, idx) => (
                    <img 
                        key={idx} 
                        src={img} 
                        className="w-full h-full object-cover flex-shrink-0 snap-center" 
                        alt={`${product.title} - ${idx + 1}`} 
                    />
                ))}
             </div>
             
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-950/90 pointer-events-none"></div>
             
             {/* Back Button */}
             <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors z-20">
                 <ChevronLeft size={24} />
             </button>
             
             {/* Image Counter (Replaces Views) */}
             <div className="absolute bottom-6 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                 <Camera size={14} /> {currentImageIndex + 1}/{product.images.length}
             </div>

             {/* Carousel Dots */}
             {product.images.length > 1 && (
                 <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
                     {product.images.map((_, idx) => (
                         <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                         />
                     ))}
                 </div>
             )}
        </div>

        {/* Content Sheet */}
        <div className="-mt-6 relative z-10 bg-slate-950 rounded-t-[2rem] px-6 pt-8">
             <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6"></div>

             {/* Header Info */}
             <div className="mb-6">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 uppercase tracking-wider mb-2 inline-block">
                        {product.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {product.postedDate}
                    </span>
                 </div>
                 
                 <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{product.title}</h1>
                 
                 <div className="flex items-center gap-3 mb-4">
                     <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                        {product.currency}{product.price.toLocaleString()}
                     </p>
                     
                     {/* Negotiable/Fixed Badge */}
                     {product.isNegotiable ? (
                         <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                            <CheckCircle size={12} /> Negotiable
                         </span>
                     ) : (
                         <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold border border-slate-600 flex items-center gap-1">
                            Fixed Price
                         </span>
                     )}
                 </div>

                 <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                     <MapPin size={16} className="text-slate-500" />
                     {product.location}
                 </div>
             </div>

             {/* Seller Card */}
             <div 
                onClick={() => onViewSeller(product.seller)}
                className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4 mb-8 cursor-pointer hover:bg-slate-900 transition-colors group"
            >
                 <img src={product.seller.avatar || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-full object-cover border-2 border-slate-800 group-hover:border-purple-500 transition-colors" alt={product.seller.name} />
                 <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100">{product.seller.name}</h3>
                        {product.seller.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                     </div>
                     <p className="text-xs text-slate-500">{product.seller.university || 'Student'}</p>
                 </div>
                 <button className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full group-hover:bg-purple-500 group-hover:text-white transition-all">
                     View Profile
                 </button>
             </div>

             {/* Description */}
             <div className="mb-8">
                 <h3 className="font-bold text-white mb-3 text-lg">Description</h3>
                 <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
                     {product.description}
                 </p>
                 <div className="mt-4 flex gap-2">
                     <span className="px-3 py-1 bg-slate-900 rounded-lg text-xs text-slate-500 font-medium border border-slate-800">Condition: {product.condition}</span>
                 </div>
             </div>

             {/* Report Button */}
             <div className="mb-24 flex justify-center pb-8">
                <button 
                    onClick={handleReport}
                    className="flex items-center gap-2 text-red-400/70 hover:text-red-400 text-xs font-bold transition-colors py-2 px-4 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                >
                    <Flag size={14} /> Report this Product
                </button>
             </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 z-40 pb-8 md:pb-4">
            <div className="max-w-md mx-auto flex gap-3">
                 <button 
                    onClick={handleStartChat}
                    disabled={startingChat}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70"
                >
                     {startingChat ? 'Starting Chat...' : <> <MessageSquare size={20} /> Chat with Seller</>}
                 </button>
            </div>
        </div>
    </div>
  );
};
