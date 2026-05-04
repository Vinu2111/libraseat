'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        // Fetch student name
        const { data: student } = await supabase
          .from('students')
          .select('name')
          .eq('id', data.session.user.id)
          .single();
        if (student?.name) {
          setUserName(student.name);
        } else {
          setUserName(data.session.user.email);
        }
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setUserName('');
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="flex items-center justify-between p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl text-white border-b border-slate-800 relative z-50">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tight">
            LibraSeat
          </span>
        </Link>
      </div>
      <div className="hidden md:flex space-x-8 font-medium">
        <Link href="/labs" className="text-slate-300 hover:text-blue-400 transition-colors">Labs</Link>
        <Link href="/booking" className="text-slate-300 hover:text-blue-400 transition-colors">My Bookings</Link>
        <Link href="/admin/dashboard" className="text-slate-300 hover:text-indigo-400 transition-colors">Admin Panel</Link>
      </div>
      <div className="flex md:hidden space-x-4 font-medium items-center">
        <Link href="/labs" className="text-slate-300 hover:text-blue-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </Link>
        <Link href="/booking" className="text-slate-300 hover:text-blue-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        </Link>
        <Link href="/admin/dashboard" className="text-slate-300 hover:text-indigo-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </Link>
      </div>
      <div className="flex space-x-2 md:space-x-4 items-center">
        {session ? (
          <>
            <span className="text-sm md:text-base text-slate-400 mr-1 md:mr-2"><span className="hidden md:inline">Hello, </span><span className="text-white font-bold">{userName || 'Student'}</span></span>
            <button 
              onClick={handleLogout}
              className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium text-sm md:text-base"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 font-medium text-sm md:text-base">Login</Link>
            <Link href="/register" className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-bold text-sm md:text-base">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
