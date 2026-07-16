'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getQuestions, recordWrongAnswer, getFavorites, toggleFavorite } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import { showToast } from '@/components/Toast';
import Header from '@/components/Header';
import { ArrowLeft, ArrowRight, Heart, MoreHorizontal, Volume2 } from 'lucide-react';

type QuizMode = 'all' | 'wrong' | 'fav';

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || '';
  const mode = (searchParams.get('mode') || 'all') as QuizMode;
  
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      
      // 从本地加载题目（Supabase 连接后改从云端加载）
      let qs = localStore.getQuestions().filter((q: any) => q.subject === subject);
      if (qs.length === 0) {
        // 没有题目，生成一些示例
        qs = generateSampleQuestions(subject);
        localStore.setQuestions([...localStore.getQuestions(), ...qs]);
      }
      setQuestions(qs);
      
      const favs = await getFavorites(u.id);
      setFavorites(new Set(favs.map((f: any) => f.question_id)));
      setLoading(false);
    };
    init();
  }, [subject, mode, router]);
  
  const currentQ = questions[currentIndex];
  
  const handleAnswer = () => {
    if (!currentQ) return;
    
    let correct = false;
    if (currentQ.type === 'single' || currentQ.type === 'judgement') {
      correct = selectedOption !== null && String(selectedOption) === String(currentQ.answer);
    } else if (currentQ.type === 'multiple') {
      const ans = Array.isArray(currentQ.answer) ? currentQ.answer : [currentQ.answer];
      correct = selectedMulti.length === ans.length && selectedMulti.every(i => ans.includes(String(i)));
    } else if (currentQ.type === 'fill' || currentQ.type === 'shortanswer') {
      correct = fillAnswer.trim().length > 0; // 简答题默认对
    }
    
    setIsCorrect(correct);
    setAnswered(true);
    
    if (!correct && user) {
      recordWrongAnswer(user.id, currentQ.id);
    }
    
    showToast(correct ? '✅ 回答正确' : '❌ 回答错误');
  };
  
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    } else {
      showToast('已完成本轮刷题');
      router.push('/');
    }
  };
  
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetState();
    }
  };
  
  const resetState = () => {
    setSelectedOption(null);
    setSelectedMulti([]);
    setFillAnswer('');
    setAnswered(false);
    setIsCorrect(false);
  };
  
  const toggleFav = async () => {
    if (!user || !currentQ) return;
    const isFav = await toggleFavorite(user.id, currentQ.id);
    const newFavs = new Set(favorites);
    if (isFav) newFavs.add(currentQ.id);
    else newFavs.delete(currentQ.id);
    setFavorites(newFavs);
    showToast(isFav ? '已收藏' : '已取消收藏');
  };
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 1.1;
      window.speechSynthesis.speak(utter);
    }
  };
  
  if (loading) return <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--fg2)' }}>加载中...</div>;
  if (!currentQ) return <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--fg2)' }}>暂无题目</div>;
  
  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
           style={{ background: 'rgba(247,248,250,0.85)', backdropFilter: 'blur(24px)', borderBottom: '0.5px solid var(--sep)' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center text-[var(--blue)]">
            <ArrowLeft size={22} />
          </button>
          <span className="text-sm font-semibold">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleFav} className="w-9 h-9 flex items-center justify-center">
            <Heart size={20} className={favorites.has(currentQ.id) ? 'fill-red-500 text-red-500' : ''} style={{ color: favorites.has(currentQ.id) ? 'var(--red)' : 'var(--fg2)' }} />
          </button>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: 'var(--sep)' }}>
        <div className="h-full transition-all duration-300" 
             style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--blue)' }} />
      </div>
      
      {/* 题目区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 题号 + 题型 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" 
                style={{ background: 'var(--pressed)', color: 'var(--fg2)' }}>
            {currentQ.type === 'single' ? '单选' : currentQ.type === 'multiple' ? '多选' : currentQ.type === 'fill' ? '填空' : currentQ.type === 'judgement' ? '判断' : '简答'}
          </span>
          <span className="text-xs" style={{ color: 'var(--fg2)' }}>{currentQ.subject}</span>
        </div>
        
        {/* 题干 */}
        <div className="text-base font-medium leading-relaxed mb-4" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          {currentQ.content}
        </div>
        
        {/* 选项区域 */}
        {currentQ.type === 'single' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map((opt: string, idx: number) => {
              let cls = 'bg-[var(--card)] border border-[var(--sep)]';
              if (answered) {
                if (idx === Number(currentQ.answer)) cls = 'option-correct';
                else if (idx === selectedOption) cls = 'option-wrong';
              } else if (selectedOption === idx) {
                cls = 'option-selected';
              }
              return (
                <button key={idx} onClick={() => !answered && setSelectedOption(idx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all ${cls}`}
                        disabled={answered}>
                  {String.fromCharCode(65 + idx)}. {opt}
                </button>
              );
            })}
          </div>
        )}
        
        {currentQ.type === 'judgement' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map((opt: string, idx: number) => {
              let cls = 'bg-[var(--card)] border border-[var(--sep)]';
              if (answered) {
                if (idx === Number(currentQ.answer)) cls = 'option-correct';
                else if (idx === selectedOption) cls = 'option-wrong';
              } else if (selectedOption === idx) {
                cls = 'option-selected';
              }
              return (
                <button key={idx} onClick={() => !answered && setSelectedOption(idx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all ${cls}`}
                        disabled={answered}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
        
        {currentQ.type === 'multiple' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map((opt: string, idx: number) => {
              const isSel = selectedMulti.includes(idx);
              let cls = 'bg-[var(--card)] border border-[var(--sep)]';
              if (answered) {
                const ans = Array.isArray(currentQ.answer) ? currentQ.answer.map(Number) : [Number(currentQ.answer)];
                if (ans.includes(idx)) cls = 'option-correct';
                else if (isSel) cls = 'option-wrong';
              } else if (isSel) {
                cls = 'option-selected';
              }
              return (
                <button key={idx} 
                        onClick={() => {
                          if (answered) return;
                          setSelectedMulti(prev => 
                            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                          );
                        }}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all ${cls}`}>
                  {String.fromCharCode(65 + idx)}. {opt}
                  {isSel && !answered && <span className="float-right">✓</span>}
                </button>
              );
            })}
            {!answered && selectedMulti.length > 0 && (
              <button onClick={handleAnswer}
                      className="w-full py-3.5 rounded-xl text-white font-semibold text-sm mt-2"
                      style={{ background: 'var(--blue)' }}>
                提交答案
              </button>
            )}
          </div>
        )}
        
        {(currentQ.type === 'fill' || currentQ.type === 'shortanswer') && (
          <div className="space-y-3">
            <textarea
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              disabled={answered}
              placeholder={currentQ.type === 'fill' ? '请输入答案，多个答案用 | 分隔' : '请输入答案'}
              className="w-full p-4 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--card)', minHeight: 100, border: '1px solid var(--sep)' }}
            />
            {!answered && (
              <button onClick={handleAnswer}
                      className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
                      style={{ background: 'var(--blue)' }}>
                提交答案
              </button>
            )}
          </div>
        )}
        
        {/* 答案解析 */}
        {answered && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--sep)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                {isCorrect ? '✅ 回答正确' : '❌ 回答错误'}
              </span>
              <button onClick={() => currentQ.analysis && speak(currentQ.analysis)} 
                      className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'var(--pressed)' }}>
                <Volume2 size={16} />
              </button>
            </div>
            <div className="text-sm" style={{ color: 'var(--fg2)', lineHeight: 1.7 }}>
              <span className="font-semibold" style={{ color: 'var(--green)' }}>答案：</span>
              {Array.isArray(currentQ.answer) ? currentQ.answer.map((a: any) => String.fromCharCode(65 + Number(a))).join('') : currentQ.answer}
            </div>
            {currentQ.analysis && (
              <div className="text-sm mt-2" style={{ color: 'var(--fg2)', lineHeight: 1.7 }}>
                <span className="font-semibold">解析：</span>{currentQ.analysis}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 底部操作栏 */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between gap-3"
           style={{ background: 'var(--bg)', borderTop: '0.5px solid var(--sep)' }}>
        <button onClick={prevQuestion} disabled={currentIndex === 0}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                style={{ background: 'var(--pressed)', color: 'var(--fg)', opacity: currentIndex === 0 ? 0.4 : 1 }}>
          <ArrowLeft size={16} /> 上一题
        </button>
        
        {(!answered && (currentQ.type === 'single' || currentQ.type === 'judgement')) && (
          <button onClick={handleAnswer} disabled={selectedOption === null}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center"
                  style={{ background: 'var(--blue)', opacity: selectedOption === null ? 0.5 : 1 }}>
            提交答案
          </button>
        )}
        
        {answered && (
          <button onClick={nextQuestion}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1"
                  style={{ background: 'var(--green)' }}>
            {currentIndex < questions.length - 1 ? '下一题' : '完成'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// 示例题目生成器
function generateSampleQuestions(subject: string): any[] {
  const samples: Record<string, any[]> = {
    '政治': [
      { id: 'pol1', subject: '政治', type: 'single', content: '马克思主义哲学的直接理论来源是？', options: ['古希腊哲学', '德国古典哲学', '英国古典政治经济学', '英法空想社会主义'], answer: '1', analysis: '马克思主义哲学的直接理论来源是德国古典哲学，特别是黑格尔的辩证法和费尔巴哈的唯物主义。' },
      { id: 'pol2', subject: '政治', type: 'single', content: '商品的价值量是由什么决定的？', options: ['商品的效用', '供求关系', '生产商品的社会必要劳动时间', '商品的价格'], answer: '2', analysis: '商品的价值量由生产该商品的社会必要劳动时间决定，这是价值规律的基本内容。' },
    ],
    '英语': [
      { id: 'eng1', subject: '英语', type: 'single', content: 'Which of the following is NOT a modal verb?', options: ['can', 'may', 'want', 'must'], answer: '2', analysis: 'Want 不是情态动词，它是实义动词。Can/may/must 都是情态动词。' },
      { id: 'eng2', subject: '英语', type: 'fill', content: 'The sun ______ in the east and sets in the west.', answer: 'rises', analysis: '太阳从东方升起，在西方落下。这是客观真理，用一般现在时。' },
    ],
    '数学': [
      { id: 'math1', subject: '数学', type: 'single', content: '函数 f(x) = x² - 4x + 3 的最小值是？', options: ['-1', '0', '1', '3'], answer: '0', analysis: 'f(x) = (x-2)² - 1，当 x=2 时取得最小值 -1。' },
      { id: 'math2', subject: '数学', type: 'multiple', content: '下列哪些是正弦函数的性质？', options: ['周期函数', '奇函数', '有界函数', '单调递增'], answer: ['0', '2'], analysis: '正弦函数是周期函数（周期2π）、奇函数、有界函数（值域[-1,1]），但不是单调递增的。' },
    ],
    '行测': [
      { id: 'xz1', subject: '行测', type: 'single', content: '1, 3, 5, 7, 9, __ 的下一个数字是？', options: ['10', '11', '12', '13'], answer: '1', analysis: '这是奇数序列，下一个数字是11。' },
      { id: 'xz2', subject: '行测', type: 'judgement', content: '所有的偶数都是合数。', options: ['正确', '错误'], answer: '1', analysis: '2是偶数但不是合数，它是质数。所以该命题错误。' },
    ],
  };
  
  const qs = samples[subject] || [
    { id: `demo_${subject}_1`, subject, type: 'single', content: `${subject}示例题目1：这是一个单选题`, options: ['选项A', '选项B', '选项C', '选项D'], answer: '0', analysis: '这是示例解析。' },
    { id: `demo_${subject}_2`, subject, type: 'fill', content: `${subject}示例题目2：这是一个填空题`, answer: '答案', analysis: '这是示例解析。' },
  ];
  
  return qs.map(q => ({ ...q, user_id: 'demo', created_at: new Date().toISOString() }));
}
