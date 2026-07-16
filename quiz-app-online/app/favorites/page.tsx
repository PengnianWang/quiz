'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getFavorites } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Heart, Play } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      const favs = await getFavorites(u.id);
      const qs = localStore.getQuestions();
      const enriched = favs.map((f: any) => {
        const q = qs.find((q: any) => q.id === f.question_id);
        return { ...f, question: q };
      }).filter((f: any) => f.question);
      setFavorites(enriched);
    };
    init();
  }, [router]);
  
  return (
    <div className="flex flex-col h-full">
      <Header title="我的收藏" />
      <div className="page-content">
        {favorites.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--fg2)' }}>
            <Heart size={36} className="mx-auto mb-3 opacity-40" />
            <div>暂无收藏</div>
          </div>
        ) : (
          favorites.map((f: any) => (
            <div key={f.id} className="rounded-xl p-4 mb-3" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-sm font-medium mb-2">{f.question.content}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--fg2)' }}>{f.question.subject}</div>
              <button onClick={() => router.push(`/quiz?subject=${f.question.subject}`)}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: 'var(--blue)' }}>
                <Play size={12} /> 去练习
              </button>
            </div>
          ))
        )}
      </div>
      <Navigation />
    </div>
  );
}
