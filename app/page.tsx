import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[100px] mix-blend-screen absolute -top-40 -right-40"></div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
        Next-Gen <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Lab Seating</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12">
        A premium PWA experience for booking and managing your laboratory seats in real-time. Built with Next.js 14, Tailwind CSS, and Supabase.
      </p>
      
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/labs" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1">
          Explore Labs
        </Link>
        <Link href="/dashboard" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-bold rounded-xl transition-all border border-slate-700 hover:border-slate-500">
          Admin Portal
        </Link>
      </div>
    </div>
  );
}
