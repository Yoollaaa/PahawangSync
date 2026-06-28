import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgLanding from '../assets/landingpage.jpeg';
import axios from 'axios'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Mohon masukkan alamat email Anda!');
      return;
    }

    setIsLoading(true);
    

    
    try {
      await axios.post('http://localhost:5000/api/forgot-password', { email });
      setIsLoading(false);
      setMessage('Tautan reset sandi telah dikirim. Silakan cek email Anda.');
      setEmail('');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
    
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgLanding})` }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-0"></div>

      <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[420px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 relative z-10 overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0284C7] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0EA5E9] rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

        <Link 
          to="/login" 
          className="absolute top-6 left-6 text-slate-500 hover:text-[#0284C7] bg-white/60 p-2.5 rounded-full transition-all hover:bg-white hover:scale-110 shadow-sm border border-white/50"
          title="Kembali ke halaman Login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>

        <div className="flex flex-col items-center justify-center mb-6 mt-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-[#0284C7] shadow-inner mb-4 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#0F172A] mb-2 text-center">
            Lupa Password?
          </h2>
          <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">
            Jangan khawatir! Masukkan email yang terdaftar, dan kami akan mengirimkan instruksi untuk mengatur ulang sandi Anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs md:text-sm p-3 rounded-xl mb-5 font-bold text-center flex items-center justify-center gap-2 animate-pulse">
            <span>⚠️</span> {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50/90 backdrop-blur-md border border-green-200 text-green-700 text-xs md:text-sm p-4 rounded-xl mb-5 font-bold text-center flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">
              Alamat Email Anda
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm md:text-base font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm placeholder:text-slate-400" 
                placeholder="cth: wisata@email.com" 
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button 
            disabled={isLoading || message !== ''} 
            type="submit" 
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-white text-sm md:text-base transition-all ${
              isLoading || message !== '' 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#0284C7] hover:to-[#0369A1] shadow-lg shadow-slate-900/20 md:hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Mengirim Tautan...
              </span>
            ) : 'Kirim Tautan Reset'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center relative z-10">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Ingat password Anda? <Link to="/login" className="text-[#0F172A] font-bold hover:text-[#0284C7] hover:underline transition-all">Kembali ke Login</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}