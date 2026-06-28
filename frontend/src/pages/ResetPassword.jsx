import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLanding from '../assets/landingpage.jpeg';

export default function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password || !confirmPassword) {
      return setError('Mohon isi kedua kolom password.');
    }
    if (password !== confirmPassword) {
      return setError('Password dan Konfirmasi tidak cocok.');
    }
    if (password.length < 6) {
      return setError('Password minimal 6 karakter.');
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', {
        token: token,
        newPassword: password
      });
      
      setIsLoading(false);
      setMessage(response.data.message);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

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

        <div className="flex flex-col items-center justify-center mb-6 mt-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-50 text-green-600 shadow-inner mb-4 border border-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#0F172A] mb-2 text-center">
            Buat Password Baru
          </h2>
          <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">
            Silakan masukkan password baru Anda. Pastikan password mudah diingat dan aman.
          </p>
        </div>

        {error && (
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs md:text-sm p-3 rounded-xl mb-5 font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50/90 backdrop-blur-md border border-green-200 text-green-700 text-sm p-4 rounded-xl mb-5 font-bold text-center">
            ✅ {message} <br/><span className="text-xs font-medium mt-1 block text-green-600">Mengalihkan ke halaman Login...</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Password Baru</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 pl-4 pr-12 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
                  placeholder="Minimal 6 Karakter" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1.5 text-slate-400 hover:text-[#0284C7] transition-colors">
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Konfirmasi Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-white/60 focus:bg-white border border-white/80 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10 transition-all shadow-sm" 
                placeholder="Ketik ulang password baru" 
              />
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full py-4 mt-2 rounded-2xl font-bold text-white text-sm transition-all bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#0284C7] hover:to-[#0369A1] shadow-lg shadow-slate-900/20 active:scale-95">
              {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}