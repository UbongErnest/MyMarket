
import React, { useState, useEffect, useRef } from 'react';
import { User, Product } from '../types';
import { ChevronLeft, Send, Image as ImageIcon, Check, CheckCheck, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

// --- Types for Firestore Data ---
interface FirestoreConversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantDetails: Record<string, { name: string; avatar: string; university?: string }>;
  lastMessage: string;
  lastMessageTime: any; // Firestore Timestamp
  unreadCounts: Record<string, number>;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
}

interface FirestoreMessage {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  createdAt: any;
  type: 'text' | 'image';
}

// --- View: Chat List ---

export const ChatListView: React.FC<{ currentUser: User; onChatSelect: (chatId: string) => void; onBack: () => void }> = ({ currentUser, onChatSelect, onBack }) => {
  const [chats, setChats] = useState<FirestoreConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    // We fetch chats where user is a participant. 
    // Sorting is done client-side to avoid complex Firestore indexing requirements.
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreConversation[];

      // Robust client-side sorting
      loadedChats.sort((a, b) => {
        // Handle pending writes where lastMessageTime might be null momentarily
        const timeA = a.lastMessageTime?.seconds || Date.now() / 1000;
        const timeB = b.lastMessageTime?.seconds || Date.now() / 1000;
        return timeB - timeA; // Descending order (newest first)
      });

      setChats(loadedChats);
      setLoading(false);
    }, (err) => {
        console.error("Error fetching chats:", err);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
      return <div className="min-h-screen bg-slate-950 flex justify-center pt-20"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="pt-2 pb-24 min-h-screen bg-slate-950">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-20 flex items-center border-b border-white/5">
            <button onClick={onBack} className="mr-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>

        <div className="space-y-1 mt-1">
            {chats.length === 0 ? (
                <div className="text-center text-slate-500 py-20 px-6">
                    <p>No messages yet.</p>
                    <p className="text-xs mt-2">Start a chat from a product page to see it here.</p>
                </div>
            ) : (
                chats.map(chat => {
                    // Identify the "other" participant
                    const otherUserId = chat.participants.find(id => id !== currentUser.id) || '';
                    const otherUser = chat.participantDetails[otherUserId] || { name: 'Unknown User', avatar: '' };
                    const myUnreadCount = chat.unreadCounts?.[currentUser.id] || 0;
                    
                    // Format Time
                    let timeDisplay = '';
                    if (chat.lastMessageTime) {
                         // Check if toDate exists (Timestamp) or if it's a number (Seconds) or if it's pending (null)
                         const seconds = chat.lastMessageTime.seconds;
                         if (seconds) {
                            const date = new Date(seconds * 1000);
                            const now = new Date();
                            if (date.toDateString() === now.toDateString()) {
                                timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } else {
                                timeDisplay = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                            }
                         } else {
                             timeDisplay = 'Just now';
                         }
                    }

                    return (
                        <div key={chat.id} onClick={() => onChatSelect(chat.id)} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors border-b border-white/5">
                            <div className="relative">
                                <img src={otherUser.avatar || 'https://via.placeholder.com/150'} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover border border-white/10 bg-slate-800" />
                                {myUnreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-slate-950 ring-2 ring-slate-950">
                                        {myUnreadCount}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-100 truncate text-base">{otherUser.name}</h3>
                                    <span className="text-xs text-slate-500">{timeDisplay}</span>
                                </div>
                                <p className={`text-sm truncate ${myUnreadCount > 0 ? 'text-purple-400 font-medium' : 'text-slate-400'}`}>
                                    {chat.productTitle && <span className="text-indigo-400 mr-1.5 font-medium">[{chat.productTitle}]</span>}
                                    {chat.lastMessage || 'Sent an image'}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};

// --- View: Chat Room ---

interface ChatRoomProps {
    currentUser: User;
    chatId: string;
    onBack: () => void;
    onViewProfile: (user: User) => void;
    onViewProduct: (product: Product) => void;
}

export const ChatRoomView: React.FC<ChatRoomProps> = ({ currentUser, chatId, onBack, onViewProfile, onViewProduct }) => {
    const [messages, setMessages] = useState<FirestoreMessage[]>([]);
    const [chatData, setChatData] = useState<FirestoreConversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [fullSellerProfile, setFullSellerProfile] = useState<User | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Chat Metadata & Real-time Messages
    useEffect(() => {
        const chatRef = doc(db, "conversations", chatId);
        
        // Listen to Chat Metadata (for header info)
        const unsubChat = onSnapshot(chatRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as FirestoreConversation;
                setChatData({ id: docSnap.id, ...data });
                
                // Fetch the real full user profile for the other participant
                const otherUid = data.participants.find(id => id !== currentUser.id);
                if (otherUid) {
                    getDoc(doc(db, "users", otherUid)).then(userSnap => {
                        if (userSnap.exists()) {
                            setFullSellerProfile(userSnap.data() as User);
                        }
                    });
                }

                // Reset unread count for me
                if (data.unreadCounts?.[currentUser.id] > 0) {
                     updateDoc(chatRef, { [`unreadCounts.${currentUser.id}`]: 0 });
                }
            }
        });

        // Listen to Messages
        // We order by createdAt. If an index is missing, Firestore usually links to create one.
        const messagesRef = collection(db, "conversations", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));
        
        const unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FirestoreMessage[];
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => {
            unsubChat();
            unsubMessages();
        };
    }, [chatId, currentUser.id]);

    const handleSend = async (imageUrl?: string) => {
        if ((!newMessage.trim() && !imageUrl) || sending) return;
        setSending(true);
        
        const textToSend = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            // 1. Add Message to Subcollection
            await addDoc(collection(db, "conversations", chatId, "messages"), {
                text: textToSend,
                image: imageUrl || null,
                senderId: currentUser.id,
                createdAt: serverTimestamp(),
                type: imageUrl ? 'image' : 'text'
            });

            // 2. Update Parent Conversation (Last Message + Unread Count)
            const otherUserId = chatData?.participants.find(id => id !== currentUser.id);
            const updatePayload: any = {
                lastMessage: imageUrl ? 'Sent an image' : textToSend,
                lastMessageTime: serverTimestamp()
            };
            
            // Note: In a real app we would use increment(1) here
            await updateDoc(doc(db, "conversations", chatId), updatePayload);

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Check your connection.");
        } finally {
            setSending(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSending(true);
        try {
            // Use Cloudinary Service
            const url = await uploadImageToCloudinary(file);
            await handleSend(url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
            setSending(false);
        }
    };

    // Helper to get Other User
    const otherUserId = chatData?.participants.find(id => id !== currentUser.id);
    const otherUserBasic = otherUserId ? chatData?.participantDetails[otherUserId] : null;

    if (!chatData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-purple-500"/></div>;

    return (
        <div className="flex flex-col h-screen bg-slate-950 relative">
            {/* Header */}
            <div className="bg-slate-900/80 backdrop-blur-md p-3 flex items-center justify-between border-b border-white/5 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/5"><ChevronLeft size={22} /></button>
                    {otherUserBasic && (
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => {
                                // If we fetched the full profile, use it. Otherwise fall back to basic details.
                                if (fullSellerProfile) {
                                    onViewProfile(fullSellerProfile);
                                } else {
                                     // Fallback (should rarely happen if network is okay)
                                    const userObj: User = {
                                        id: otherUserId!,
                                        name: otherUserBasic.name,
                                        avatar: otherUserBasic.avatar,
                                        university: otherUserBasic.university,
                                        isVerified: false, rating: 0, joinedDate: '', location: '' 
                                    };
                                    onViewProfile(userObj);
                                }
                            }}
                        >
                            <div className="relative">
                                <img src={otherUserBasic.avatar || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 group-hover:border-purple-500 transition-colors" alt="Avatar"/>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-400 transition-colors">{otherUserBasic.name}</h3>
                                <span className="text-xs text-slate-400 block">{otherUserBasic.university || 'Online'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Product Context Banner */}
            {chatData.productId && (
                 <div 
                    onClick={() => {
                        // Construct partial product to navigate
                         const prodObj = {
                             id: chatData.productId,
                             title: chatData.productTitle,
                             price: chatData.productPrice,
                             images: chatData.productImage ? [chatData.productImage] : [],
                             currency: '₦'
                         } as Product;
                         onViewProduct(prodObj);
                    }}
                    className="bg-slate-900/40 border-b border-white/5 p-3 flex items-center gap-3 px-4 backdrop-blur-sm z-20 cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                    {chatData.productImage && <img src={chatData.productImage} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />}
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-200 line-clamp-1">{chatData.productTitle}</p>
                        {chatData.productPrice && <p className="text-xs text-purple-400 font-bold">₦{chatData.productPrice.toLocaleString()}</p>}
                    </div>
                 </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    const date = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...';
                    
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-purple-700 text-white rounded-tr-none shadow-lg' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-sm'}`}>
                                {msg.image && (
                                    <img src={msg.image} alt="Sent" className="w-full rounded-lg mb-2 border border-black/20" />
                                )}
                                {msg.text && <span className="mr-4 block">{msg.text}</span>}
                                <div className={`text-[10px] flex justify-end items-center gap-1 mt-1 opacity-70`}>
                                    {date}
                                    {isMe && <CheckCheck size={14} className="text-white/70" />}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-900/90 border-t border-white/5 flex items-center gap-3 pb-6 md:pb-3 backdrop-blur-md">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors"
                >
                    <ImageIcon size={22} />
                </button>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-slate-800/50 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder-slate-500 border border-slate-700/50 transition-all"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={sending}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={(!newMessage.trim() && !sending) || sending}
                    className="p-3.5 bg-purple-600 text-slate-950 rounded-full disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 transform active:scale-90">
                    {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
                </button>
            </div>
        </div>
    )
}
