'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import { showToast } from '@/components/Toast';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Moon, Sun, Download, Upload, LogOut, ChevronRight, FileJson, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({
    soundEffect: true,
    bgMusic: false,
    autoReadAnalysis: false,
    autoRemoveWrong: true,
  });
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const s = localStore.getSettings();
      setSettings(s);
      setTheme(s.theme || 'light');
    };
    init();
  }, [router]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    const s = { ...settings, theme: newTheme as 'light' | 'dark' };
    setSettings(s);
    localStore.setSettings(s);
  };
  
  const exportData = () => {
    const data = localStore.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('备份已导出');
  };
  
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        localStore.importAll(data);
        showToast('数据导入成功');
      } catch {
        showToast('文件格式错误');
      }
    };
    reader.readAsText(file);
  };
  
  const clearAll = () => {
    if (confirm('确定要清空所有本地数据吗？此操作不可恢复。')) {
      localStore.clear();
      showToast('数据已清空');
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    showToast('已退出登录');
    router.push('/login');
  };
  
  return (
    <div className="flex flex-col h-full">
      <Header title="设置" showBack={false} />
      
      <div className="page-content">
        {/* 用户信息 */}
        <div className="rounded-xl p-4 mb-4 flex items-center gap-3"
             style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
               style={{ background: 'var(--blue)', color: 'white' }}>
            {(user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user?.email || '用户'}</div>
            <div className="text-xs" style={{ color: 'var(--fg2)' }}>ID: {user?.id?.slice(0, 8) || '--'}</div>
          </div>
        </div>
        
        {/* 外观设置 */}
        <div className="mb-3">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>外观</div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid var(--sep)' }}>
              <div className="flex items-center gap-2">
                {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm">深色模式</span>
              </div>
              <button onClick={toggleTheme}
                      className="w-12 h-6 rounded-full relative transition-colors"
                      style={{ background: theme === 'dark' ? 'var(--blue)' : 'var(--pressed)' }}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* 数据管理 */}
        <div className="mb-3">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>数据管理</div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button onClick={exportData} className="w-full flex items-center justify-between px-4 py-3 text-left"
                    style={{ borderBottom: '0.5px solid var(--sep)' }}>
              <div className="flex items-center gap-2">
                <Download size={18} style={{ color: 'var(--fg2)' }} />
                <span className="text-sm">导出备份</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--fg2)' }} />
            </button>
            <label className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
                   style={{ borderBottom: '0.5px solid var(--sep)' }}>
              <div className="flex items-center gap-2">
                <Upload size={18} style={{ color: 'var(--fg2)' }} />
                <span className="text-sm">导入恢复</span>
              </div>
              <input type="file" accept=".json" onChange={importData} className="hidden" />
              <ChevronRight size={16} style={{ color: 'var(--fg2)' }} />
            </label>
            <button onClick={clearAll} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <Trash2 size={18} style={{ color: 'var(--red)' }} />
                <span className="text-sm" style={{ color: 'var(--red)' }}>清空本地数据</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--fg2)' }} />
            </button>
          </div>
        </div>
        
        {/* 关于 */}
        <div className="mb-3">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>关于</div>
          <div className="rounded-xl overflow-hidden p-4 text-center" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="text-2xl mb-2">📖</div>
            <div className="font-semibold">随身刷题本 v2.0</div>
            <div className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>云端刷题 · AI 解析 · 错题管理</div>
          </div>
        </div>
        
        {/* 退出登录 */}
        <button onClick={handleLogout}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--red)' }}>
          <LogOut size={16} /> 退出登录
        </button>
      </div>
      
      <Navigation />
    </div>
  );
}
