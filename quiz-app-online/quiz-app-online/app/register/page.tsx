'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase';
import { showToast } from '@/components/Toast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleRegister = async () => {
    if (!email || !password) { showToast('请填写邮箱和密码'); return; }
    if (password !== confirmPw) { showToast('两次密码不一致'); return; }
    if (password.length < 6) { showToast('密码至少6位'); return; }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) { showToast(error.message); return; }
    showToast('注册成功，请登录');
    router.push('/login');
  };
  
  return (
    <div className="flex flex-col h-full px-6 pt-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">创建账号</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--fg2)' }}>注册后开启云端刷题</p>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fg2)' }} />
          <input
            type="email"
            placeholder="邮箱地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', color: 'var(--fg)' }}
          />
        </div>
        
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fg2)' }} />
          <input
            type="text"
            placeholder="昵称（选填）"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', color: 'var(--fg)' }}
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fg2)' }} />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="设置密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', color: 'var(--fg)' }}
          />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPw ? <EyeOff size={18} style={{ color: 'var(--fg2)' }} /> : <Eye size={18} style={{ color: 'var(--fg2)' }} />}
          </button>
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fg2)' }} />
          <input
            type="password"
            placeholder="确认密码"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', color: 'var(--fg)' }}
          />
        </div>
        
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base mt-4"
          style={{ background: 'var(--green)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '注册中...' : '注册'}
        </button>
        
        <div className="text-center mt-4">
          <button onClick={() => router.push('/login')} className="text-sm" style={{ color: 'var(--fg2)' }}>
            已有账号？去登录
          </button>
        </div>
      </div>
    </div>
  );
}
