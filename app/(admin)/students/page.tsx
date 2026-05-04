'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s => 
    (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.mobile?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Registered Students</h1>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-5 font-medium">Name</th>
                  <th className="p-5 font-medium">Mobile</th>
                  <th className="p-5 font-medium">Email</th>
                  <th className="p-5 font-medium">Gender</th>
                  <th className="p-5 font-medium">DOB</th>
                  <th className="p-5 font-medium">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-5 font-medium text-white">{student.name}</td>
                    <td className="p-5 font-mono text-sm text-slate-400">{student.mobile || 'N/A'}</td>
                    <td className="p-5 text-slate-400">{student.email || 'N/A'}</td>
                    <td className="p-5 capitalize">{student.gender || 'N/A'}</td>
                    <td className="p-5 text-sm">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-5 text-sm text-slate-500">{new Date(student.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No students found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
