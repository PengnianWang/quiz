'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserProfile } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import { SUBJECT_ORDER, SUBJECT_ICONS } from '@/types';
import Navigation from '@/components/Navigation';
import Toast, { showToast } from '@/components/Toast';
import { Zap, Database, TrendingUp, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, today: 0, wrong: 0, streak: 0 });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const p = await getUserProfile(u.id);
      setProfile(p);
      
      // 计算统计（先从本地）
      const qs = localStore.getQuestions();
      const ws = localStore.getWrongBook();
      const today = new Date().toDateString();
      setStats({
        total: qs.length,
        today: qs.filter((q: any) => new Date(q.created_at).toDateString() === today).length,
        wrong: ws.length,
        streak: 0, // 可以从设置中读取
      });
    };
    init();
  }, [router]);
  
  const handleStartQuiz = (subject: string) => {
    if (!selectedSubject) {
      showToast('请先选择一个学科');
      return;
    }
    router.push(`/quiz?subject=${encodeURIComponent(selectedSubject)}`);
  };
  
  return (
    <div className="flex flex-col h-full">
      <Toast />
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '0.5px solid var(--sep)' }}>
        <div>
          <h1 className="text-xl font-bold">随身刷题本</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg2)' }}>
            {profile?.nickname || user?.email?.split('@')[0] || '用户'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/recharge')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(0,122,255,0.1)', color: 'var(--blue)' }}>
            <Zap size={14} />
            {profile?.balance_points || 0} 积分
          </button>
        </div>
      </header>
      
      <div className="page-content">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { num: stats.total, label: '总题数', icon: Database },
            { num: stats.today, label: '今日新题', icon: TrendingUp },
            { num: stats.wrong, label: '错题数', icon: Award },
            { num: stats.streak || 0, label: '连续天数', icon: Zap },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2 text-center" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-xl font-semibold">{s.num}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--fg2)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        
        {/* 学科选择 */}
        <div className="mb-3">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>选择学科</div>
          <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden"
               style={{ background: 'var(--sep)' }}>
            {SUBJECT_ORDER.map((subj) => {
              const isSelected = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(isSelected ? null : subj)}
                  className={`flex flex-col items-center justify-center py-3 px-2 transition-all ${
                    isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--card)] text-[var(--fg)]'
                  }`}
                  style={{ minHeight: 72 }}
                >
                  <span className="text-xl mb-0.5">{SUBJECT_ICONS[subj] || '📝'}</span>
                  <span className="text-xs font-semibold">{subj}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 快速操作 */}
        <div className="mb-4">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>快速操作</div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button onClick={() => selectedSubject ? handleStartQuiz(selectedSubject) : showToast('请先选择学科')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
                    style={{ color: 'var(--blue)', borderBottom: '0.5px solid var(--sep)' }}>
              ▶️ 开始刷题
            </button>
            <button onClick={() => router.push('/wrongbook')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
                    style={{ color: 'var(--red)' }}>
              📖 错题复习
            </button>
          </div>
        </div>
        
        {/* 导入数据 */}
        <div className="mb-4">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>数据迁移</div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--fg2)' }}>从旧版刷题本导入数据</p>
            <button className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--pressed)', color: 'var(--fg)' }}
                    onClick={() => showToast('请前往设置页导入')}>去导入</button>
          </div>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
}
