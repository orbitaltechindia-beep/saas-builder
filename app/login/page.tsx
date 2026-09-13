'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          role: 'admin',
          customDomainRequest: null,
          createdAt: new Date()
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Orbital Builder</h1>
        <p className="text-neutral-400 text-sm mt-1">The ultimate website platform for agencies.</p>
      </div>

      <div className="relative z-10 w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-neutral-800/50 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-neutral-800/50 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}