'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }
    window.location.href = '/labs';
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl">
      <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Welcome Back</h1>
      <p className="text-slate-400 text-center mb-8">Sign in to LibraSeat</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one now</Link>
        </p>
      </form>
    </div>
  );
}
