
import React, { useState, useEffect } from 'react';
import { BottomNav, TopBar } from './components/Navigation';
import { HomeView } from './views/Home';
import { ProductDetailView } from './views/ProductDetail';
import { SellView } from './views/Sell';
import { ChatListView, ChatRoomView } from './views/Chat';
import { ProfileView } from './views/Profile';
import { LoginView, RegisterView, ForgotPasswordView } from './views/Auth';
import { Product, User } from './types';
import { MOCK_PRODUCTS, MOCK_USERS } from './constants';
import { SellerProfileView } from './views/SellerProfile';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 fade-in duration-300 ${type === 'success' ? 'bg-slate-900/90 border-green-500/50 text-green-400' : 'bg-slate-900/90 border-red-500/50 text-red-400'}`}>
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-bold text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white"><X size={14} /></button>
    </div>
);

function App() {
  const [userSession, setUserSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');
  
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [viewingSeller, setViewingSeller] = useState<User | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
  };

  // 0. Listen for PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log("Install prompt captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    } else {
      // Manual fallback for iOS or if already installed
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        showToast("On iOS: Tap the 'Share' button below, then 'Add to Home Screen'", 'success');
      } else {
        showToast("App is already installed or check browser settings.", 'success');
      }
    }
  };

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUserSession(user);
      if (user) {
        // Fetch full user profile from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // CRITICAL FIX: Merge doc.id with data to ensure ID exists
          setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
            // Fallback if user exists in Auth but not DB
             setCurrentUser({
                id: user.uid,
                name: user.displayName || 'User',
                email: user.email || '',
                avatar: user.photoURL || '',
                isVerified: false,
                rating: 0,
                joinedDate: 'Just now',
                location: ''
             });
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Real-time Products
  useEffect(() => {
      const q = query(collection(db, "products"), orderBy("postedDate", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedProducts = snapshot.docs.map(doc => {
              const data = doc.data();
              // Calculate relative time for display
              let timeDisplay = 'Just now';
              try {
                  const postedDate = new Date(data.postedDate);
                  const now = new Date();
                  const diffHrs = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60));
                  if (diffHrs > 24) timeDisplay = `${Math.floor(diffHrs / 24)} days ago`;
                  else if (diffHrs > 0) timeDisplay = `${diffHrs} hours ago`;
              } catch (e) {
                  // Fallback
              }

              return { 
                  id: doc.id, 
                  ...data,
                  postedDate: timeDisplay
              } as Product;
          });
          setProducts(loadedProducts);
          setLoadingProducts(false);
      }, (error) => {
          console.error("Error fetching products:", error);
          setProducts(MOCK_PRODUCTS);
          setLoadingProducts(false);
      });
      return () => unsubscribe();
  }, []);

  // 3. Listen for Unread Messages
  useEffect(() => {
    if (!currentUser?.id) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalUnread += (data.unreadCounts?.[currentUser.id] || 0);
      });
      setUnreadMessages(totalUnread);
    }, (error) => {
      console.log("Unread count listener error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);


  const handleUpdateUser = async (updatedUser: User) => {
      if (!currentUser) return;
      setCurrentUser(updatedUser);
      try {
          await updateDoc(doc(db, "users", currentUser.id), { ...updatedUser });
          showToast("Profile updated successfully", 'success');
      } catch (e) {
          console.error("Error updating profile", e);
          showToast("Failed to update profile", 'error');
      }
  }

  const handleUpdateProductStatus = async (productId: string, status: 'sold' | 'deleted') => {
      // Store previous state for rollback
      const previousProducts = [...products];

      // Optimistic Update: Update UI immediately 
      if (status === 'deleted') {
          setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'sold' } : p));
      }

      try {
          if (status === 'deleted') {
              await deleteDoc(doc(db, "products", productId));
              showToast("Ad deleted successfully", 'success');
          } else {
              await updateDoc(doc(db, "products", productId), { status: 'sold' });
              showToast("Marked as sold", 'success');
          }
      } catch (e: any) {
          console.error("Error updating product status", e);
          
          // REVERT OPTIMISTIC UPDATE
          setProducts(previousProducts);

          if (e.code === 'permission-denied') {
              showToast("Permission denied: You can only edit your own ads.", 'error');
          } else {
              showToast(`Action failed: ${e.message}`, 'error');
          }
      }
  }

  const handleLogout = async () => {
      await signOut(auth);
      setAuthView('login');
      setCurrentTab('home');
      setUnreadMessages(0);
      setSearchQuery('');
  }

  if (loadingUser) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">
              <Loader2 className="animate-spin" size={48} />
          </div>
      )
  }

  // Auth Flow
  if (!currentUser) {
      if (authView === 'login') {
          return <LoginView onLogin={() => {}} onNavigate={setAuthView} />;
      }
      if (authView === 'register') {
          return <RegisterView onLogin={() => {}} onNavigate={setAuthView} />;
      }
      if (authView === 'forgot-password') {
          return <ForgotPasswordView onLogin={() => {}} onNavigate={setAuthView} />;
      }
  }

  // App Flow
  const renderView = () => {
    if (viewingSeller) {
        return (
            <SellerProfileView 
                seller={viewingSeller}
                products={products}
                onBack={() => setViewingSeller(null)}
                onProductClick={(p) => {
                    setViewingSeller(null); 
                    setSelectedProduct(p);
                }}
            />
        )
    }

    if (currentTab === 'chat' && selectedChatId) {
        return (
            <ChatRoomView 
                currentUser={currentUser}
                chatId={selectedChatId} 
                onBack={() => setSelectedChatId(null)} 
                onViewProfile={(user) => setViewingSeller(user)}
                onViewProduct={(prod) => {
                    const p = products.find(p => p.id === prod.id) || prod;
                    setSelectedProduct(p);
                }}
            />
        )
    }

    if (selectedProduct) {
      return (
        <ProductDetailView 
            product={selectedProduct}
            currentUser={currentUser}
            onBack={() => setSelectedProduct(null)} 
            onChat={(chatId) => {
                setSelectedProduct(null);
                setCurrentTab('chat');
                setSelectedChatId(chatId);
            }}
            onViewSeller={(seller) => setViewingSeller(seller)}
        />
      );
    }

    if (currentTab === 'sell') {
      return <SellView onBack={() => setCurrentTab('home')} currentUser={currentUser} />;
    }

    switch (currentTab) {
      case 'home':
        return (
            <>
                <TopBar 
                    currentUser={currentUser} 
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                {loadingProducts ? (
                    <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-slate-500" /></div>
                ) : (
                    <HomeView 
                        products={products} 
                        onProductClick={setSelectedProduct} 
                        searchQuery={searchQuery}
                    />
                )}
            </>
        );
      case 'chat':
        return <ChatListView currentUser={currentUser} onChatSelect={setSelectedChatId} onBack={() => setCurrentTab('home')} />;
      case 'profile':
        return (
            <ProfileView 
                currentUser={currentUser}
                userProducts={products}
                onUpdateUser={handleUpdateUser}
                onUpdateProductStatus={handleUpdateProductStatus}
                onLogout={handleLogout} 
                onBack={() => setCurrentTab('home')} 
                onInstallApp={handleInstallApp}
            />
        );
      default:
        return (
            <>
                <TopBar 
                    currentUser={currentUser} 
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <HomeView 
                    products={products} 
                    onProductClick={setSelectedProduct} 
                    searchQuery={searchQuery}
                />
            </>
        );
    }
  };

  const showBottomNav = !selectedProduct && !selectedChatId && currentTab !== 'sell' && !viewingSeller;

  return (
    <div className="max-w-md mx-auto bg-slate-950 min-h-screen relative shadow-2xl shadow-black overflow-hidden md:border-x md:border-slate-800 text-slate-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {renderView()}
      {showBottomNav && (
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} unreadCount={unreadMessages} />
      )}
    </div>
  );
}

export default App;
