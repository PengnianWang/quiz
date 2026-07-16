'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getWrongAnswers, removeWrongAnswer } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import { showToast } from '@/components/Toast';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Trash2, ChevronDown, ChevronUp, Play } from 'lucide-react';

export default function WrongBookPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wrongs, setWrongs] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      
      // 先从本地加载
      const localWrongs = localStore.getWrongBook();
      const enriched = localWrongs.map((w: any) => {
        const q = localStore.getQuestions().find((q: any) => q.id === w.question_id);
        return { ...w, question: q };
      }).filter((w: any) => w.question);
      setWrongs(enriched);
      setLoading(false);
    };
    init();
  }, [router]);
  
  const handleRemove = async (id: string) => {
    await removeWrongAnswer(id);
    const localWrongs = localStore.getWrongBook().filter((w: any) => w.id !== id);
    localStore.setWrongBook(localWrongs);
    setWrongs(wrongs.filter(w => w.id !== id));
    showToast('已移除');
  };
  
  const grouped = wrongs.reduce((acc: any, w: any) => {
    const subj = w.question?.subject || '未知';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(w);
    return acc;
  }, {});
  
  if (loading) return <div className="flex items-center justify-center h-full">加载中...</div>;
  
  return (
    <div className="flex flex-col h-full">
      <Header title="错题本" right={
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--red)' }}>
          {wrongs.length} 题
        </span>
      } />
      
      <div className="page-content">
        {wrongs.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--fg2)' }}>
            <div className="text-4xl mb-3">📝</div>
            <div>暂无错题</div>
            <div className="text-xs mt-2">刷题时答错的题目会出现在这里</div>
          </div>
        ) : (
          Object.entries(grouped).map(([subject, items]: [string, any]) => (
            <div key={subject} className="rounded-xl overflow-hidden mb-3" 
                 style={{ background: 'var(--card)', border: '0.5px solid var(--sep)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="px-4 py-2.5 text-sm font-medium flex items-center justify-between"
                   style={{ background: 'var(--bg)' }}>
                <span>{subject}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--pressed)', color: 'var(--fg2)' }}>
                  {items.length} 题
                </span>
              </div>
              {items.map((w: any, idx: number) => (
                <div key={w.id} className="border-t border-[var(--sep)]">
                  <div className="px-4 py-3 flex items-center justify-between cursor-pointer"
                       onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--fg2)' }}>{idx + 1}</span>
                      <span className="text-sm font-medium line-clamp-1">{w.question.content}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" 
                            style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--red)' }}>
                        错{w.wrong_count}次
                      </span>
                      {expandedId === w.id ? <ChevronUp size={16} style={{ color: 'var(--fg2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--fg2)' }} />}
                    </div>
                  </div>
                  
                  {expandedId === w.id && (
                    <div className="px-4 pb-3">
                      <div className="text-sm mb-2" style={{ color: 'var(--fg2)', lineHeight: 1.7 }}>
                        {w.question.options && w.question.options.map((opt: string, i: number) => (
                          <div key={i} className={`px-2 py-1 rounded mb-1 text-sm ${
                            String(w.question.answer).includes(String(i)) || (Array.isArray(w.question.answer) && w.question.answer.includes(String(i)))
                              ? 'bg-green-50 text-green-700' : 'bg-[var(--bg)]'
                          }`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm mb-2">
                        <span className="font-semibold text-green-600">答案：</span>
                        {Array.isArray(w.question.answer) 
                          ? w.question.answer.map((a: any) => String.fromCharCode(65 + Number(a))).join('') 
                          : !isNaN(Number(w.question.answer)) ? String.fromCharCode(65 + Number(w.question.answer)) : w.question.answer}
                      </div>
                      {w.question.analysis && (
                        <div className="text-sm p-3 rounded-lg mb-2" style={{ background: 'var(--bg)', color: 'var(--fg2)', lineHeight: 1.7 }}>
                          <span className="font-semibold" style={{ color: 'var(--fg)' }}>解析：</span>{w.question.analysis}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleRemove(w.id)}
                                className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                                style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--red)' }}>
                          <Trash2 size={14} /> 移除
                        </button>
                        <button onClick={() => router.push(`/quiz?subject=${w.question.subject}`)}
                                className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                                style={{ background: 'rgba(0,122,255,0.08)', color: 'var(--blue)' }}>
                          <Play size={14} /> 重练
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <Navigation />
    </div>
  );
}
