
import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Building, BookOpen, FileText, ArrowRight, CheckCircle, ChevronLeft, Loader2, AlertCircle, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: () => void;
  onNavigate: (view: 'login' | 'register' | 'forgot-password') => void;
}

// --- Utility: Firebase Error Translator ---
const getFirebaseErrorMessage = (error: any): string => {
  // Check for network connectivity explicitly first
  if (!navigator.onLine) {
    return "No internet connection. Please check your network settings.";
  }

  const code = error.code;
  const message = error.message;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Invalid email or password. Please try again.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Please login instead.";
    case 'auth/weak-password':
      return "Password is too weak. It must be at least 6 characters.";
    case 'auth/invalid-email':
      return "The email address is badly formatted.";
    case 'auth/network-request-failed':
      return "Network error. Please check your connection and try again.";
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please try again later.";
    case 'auth/operation-not-allowed':
      return "Email/Password login is not enabled in Firebase Console.";
    default:
      return message || "An unexpected error occurred. Please try again.";
  }
};

export const LoginView: React.FC<AuthProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!navigator.onLine) {
        setError("No internet connection.");
        return;
    }

    if (email && password) {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } catch (err: any) {
        console.error("Login Error:", err);
        setError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else {
        setError("Please fill in all fields.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 glass-card p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8 flex flex-col items-center">
            {logoError ? (
                 <div className="w-16 h-16 rounded-xl shadow-lg shadow-purple-500/20 mb-4 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <ShoppingBag className="text-white w-8 h-8" />
                 </div>
            ) : (
                <img 
                    src="https://res.cloudinary.com/dfn83v6jq/image/upload/v1740636841/IMG-20250227-WA0001_1_m5f0k7.jpg" 
                    alt="We Logo"
                    className="w-16 h-16 rounded-xl shadow-lg shadow-purple-500/20 mb-4 object-cover"
                    onError={() => setLogoError(true)}
                />
            )}
            
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-2 tracking-tight">We</h1>
            <p className="text-slate-400 font-medium">Student Marketplace</p>
            <p className="text-purple-400/90 text-xs mt-2 font-medium italic tracking-wide">Communicate better with your products</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="student@uni.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-11 pr-12 py-3.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl shadow-lg shadow-purple-600/20 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              New here?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
      </div>
    </div>
  );
};

export const RegisterView: React.FC<AuthProps> = ({ onLogin, onNavigate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    university: '',
    department: '',
    state: '',
    about: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
          setError("Please fill in all fields.");
          return false;
      }
      if (formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return false;
      }
      setError("");
      return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!navigator.onLine) {
        setError("No internet connection.");
        return;
    }

    setLoading(true);
    
    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Create User Profile in Firestore
        const newUser: UserType = {
            id: user.uid,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            university: formData.university,
            department: formData.department,
            state: formData.state,
            bio: formData.about,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.fullName}`, // Default avatar
            isVerified: false,
            rating: 0,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            location: formData.state
        };

        await setDoc(doc(db, "users", user.uid), newUser);
        onLogin();

    } catch (err: any) {
        console.error("Register Error:", err);
        setError(getFirebaseErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };

  const nextStep = () => {
      if(validateStep1()) setStep(step + 1);
  };
  
  const prevStep = () => {
      setError('');
      setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col px-6 py-8 relative">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mb-6 flex items-center">
        <button onClick={() => step === 1 ? onNavigate('login') : prevStep()} className="text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors">
          <ChevronLeft size={18} /> <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="relative z-10 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join We</h1>
        <p className="text-slate-400 text-sm">Step {step} of 2 • {step === 1 ? 'Personal Details' : 'Student Profile'}</p>
        <div className="w-full bg-slate-800/50 h-1.5 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
            <div className={`h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative z-10">
        {step === 1 ? (
          <div className="space-y-4 flex-1 animate-in slide-in-from-right fade-in duration-300">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. David Johnson"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
              </div>
             </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="student@uni.edu.ng"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Phone</label>
              <div className="relative">
                <Phone className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="tel"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="0902 596 8416"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-12 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
             </div>
            <button
              type="button"
              onClick={nextStep}
              className="mt-8 w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-purple-500/20 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-4 flex-1 animate-in slide-in-from-right fade-in duration-300">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">University</label>
              <div className="relative">
                <Building className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. UNILAG"
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                />
              </div>
             </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Department</label>
              <div className="relative">
                <BookOpen className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>
             </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Residence</label>
              <div className="relative">
                <MapPin className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. Hostel A, Off-campus"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
             </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Bio</label>
              <div className="relative">
                <FileText className="absolute top-3.5 left-4 h-5 w-5 text-slate-500" />
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600 text-sm"
                  placeholder="What do you usually sell?"
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                ></textarea>
              </div>
             </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-purple-500/20 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><span className="mr-1">Finish Registration</span> <CheckCircle size={18} /></>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export const ForgotPasswordView: React.FC<AuthProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!navigator.onLine) {
        setError("No internet connection.");
        return;
    }

    if (!email) {
        setError("Please enter your email.");
        return;
    }

    setLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        setSent(true);
    } catch (err: any) {
        console.error("Forgot Password Error:", err);
        setError(getFirebaseErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };

  if (sent) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-6 text-center">
             <div className="bg-purple-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-purple-500/20">
                <Mail className="h-10 w-10 text-purple-400" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-3">Check your email</h2>
             <p className="text-slate-400 mb-8 leading-relaxed">We have sent password recovery instructions to <span className="text-purple-400 font-semibold">{email}</span></p>
             <button
                onClick={() => onNavigate('login')}
                className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400"
             >
                Back to Login
             </button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]"></div>

      <button onClick={() => onNavigate('login')} className="text-slate-400 hover:text-white flex items-center gap-1 mb-10 w-fit relative z-10 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ChevronLeft size={18} /> <span className="text-sm font-medium">Back</span>
      </button>

      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-slate-400">Enter your email address to recover your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
            </div>
        )}
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="email"
              required
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
              placeholder="student@uni.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-purple-500/20 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Recovery Email'}
        </button>
      </form>
    </div>
  );
};
