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
    <nav className="flex items-center justify-between p-6 bg-slate-900/80 backdrop-blur-xl text-white border-b border-slate-800 relative z-50">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tight">
            LibraSeat
          </span>
        </Link>
      </div>
      <div className="hidden md:flex space-x-8 font-medium">
        <Link href="/labs" className="text-slate-300 hover:text-blue-400 transition-colors">Labs</Link>
        <Link href="/booking" className="text-slate-300 hover:text-blue-400 transition-colors">My Bookings</Link>
        <Link href="/admin/dashboard" className="text-slate-300 hover:text-indigo-400 transition-colors">Admin Panel</Link>
      </div>
      <div className="flex space-x-4 items-center">
        {session ? (
          <>
            <span className="hidden md:block text-slate-400 mr-2">Hello, <span className="text-white font-bold">{userName || 'Student'}</span></span>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 font-medium">Login</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-bold">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
