import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Chrome } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup';

const AuthModal = () => {
  const {
    isAuthModalOpen, closeAuthModal, error, clearError,
    signInWithEmail, signUpWithEmail, signInWithGoogle, loading
  } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  };

  const switchMode = () => {
    clearError();
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={closeAuthModal} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl heading-font uppercase tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Join'} <span className="italic text-[#FF4D8D]">K-MIRROR</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">
                {mode === 'signin' ? 'Sign in to save your analysis' : 'Create your beauty profile'}
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                <p className="text-xs text-yellow-700 font-medium">
                  Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable auth.
                </p>
              </div>
            )}

            <button
              onClick={signInWithGoogle}
              disabled={!isSupabaseConfigured || loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-40 mb-6"
            >
              <Chrome size={16} /> Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#F9F9F9] rounded-2xl pl-10 pr-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium px-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isSupabaseConfigured || loading}
                className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all disabled:opacity-40"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-6 text-[10px] text-gray-400">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={switchMode} className="font-black text-black hover:text-[#FF4D8D] transition-colors uppercase">
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
