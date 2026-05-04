'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
      <aside className="w-full md:w-64 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Admin Portal</h2>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link href="/dashboard" className={`block px-5 py-3 rounded-xl font-medium transition-all ${pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            Dashboard
          </Link>
          <Link href="/students" className={`block px-5 py-3 rounded-xl font-medium transition-all ${pathname === '/students' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            Students
          </Link>
          <Link href="/payments" className={`block px-5 py-3 rounded-xl font-medium transition-all ${pathname === '/payments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            Payments
          </Link>
        </nav>
      </aside>
      <div className="flex-1 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl overflow-x-auto min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
