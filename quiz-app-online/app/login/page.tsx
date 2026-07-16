'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';
import { showToast } from '@/components/Toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email || !password) { showToast('请填写邮箱和密码'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { showToast(error.message); return; }
    showToast('登录成功');
    router.push('/');
  };
  
  return (
    <div className="flex flex-col h-full px-6 pt-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📖</div>
        <h1 className="text-2xl font-bold">随身刷题本</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--fg2)' }}>登录后数据云端同步</p>
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
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fg2)' }} />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', color: 'var(--fg)' }}
          />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPw ? <EyeOff size={18} style={{ color: 'var(--fg2)' }} /> : <Eye size={18} style={{ color: 'var(--fg2)' }} />}
          </button>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base mt-4"
          style={{ background: 'var(--blue)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        
        <div className="text-center mt-4">
          <button onClick={() => router.push('/register')} className="text-sm" style={{ color: 'var(--blue)' }}>
            还没有账号？立即注册
          </button>
        </div>
      </div>
      
      <div className="mt-auto mb-8 text-center text-xs" style={{ color: 'var(--fg2)' }}>
        登录即表示同意《用户协议》和《隐私政策》
      </div>
    </div>
  );
}
