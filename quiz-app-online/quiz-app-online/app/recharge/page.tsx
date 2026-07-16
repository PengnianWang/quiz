'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserProfile, getTransactions } from '@/lib/supabase';
import { showToast } from '@/components/Toast';
import Header from '@/components/Header';
import { Zap, Clock, Receipt } from 'lucide-react';

const PACKAGES = [
  { points: 10000, price: 1, label: '入门包', color: '#34C759' },
  { points: 50000, price: 5, label: '常用包', color: '#007AFF' },
  { points: 120000, price: 10, label: '超值包', color: '#FF9500', hot: true },
  { points: 600000, price: 50, label: '尊享包', color: '#FF3B30' },
];

export default function RechargePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const p = await getUserProfile(u.id);
      setProfile(p);
      const txs = await getTransactions(u.id);
      setTransactions(txs);
      setLoading(false);
    };
    init();
  }, [router]);
  
  const handleRecharge = async (pkg: typeof PACKAGES[0]) => {
    // 这里集成易支付，先展示占位逻辑
    showToast(`请配置支付接口后，即可充值 ${pkg.price} 元`);
  };
  
  return (
    <div className="flex flex-col h-full">
      <Header title="积分充值" />
      
      <div className="page-content">
        {/* 余额卡片 */}
        <div className="rounded-xl p-5 mb-4 text-center relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="text-sm opacity-80 mb-1">当前积分余额</div>
          <div className="text-4xl font-bold">{(profile?.balance_points || 0).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">累计充值：{(profile?.total_recharged || 0).toLocaleString()} 积分</div>
        </div>
        
        {/* 充值套餐 */}
        <div className="mb-4">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>选择套餐</div>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((pkg, idx) => (
              <button key={idx} onClick={() => handleRecharge(pkg)}
                      className="rounded-xl p-3 text-left relative transition-all active:scale-95"
                      style={{ background: 'var(--card)', border: '1px solid var(--sep)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {pkg.hot && (
                  <span className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                        style={{ background: 'var(--red)' }}>HOT</span>
                )}
                <div className="text-xs font-medium mb-1" style={{ color: pkg.color }}>{pkg.label}</div>
                <div className="text-xl font-bold">{(pkg.points / 10000).toFixed(1)}万</div>
                <div className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>¥{pkg.price}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 计费说明 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="text-sm font-medium mb-2">计费说明</div>
          <div className="text-xs space-y-2" style={{ color: 'var(--fg2)', lineHeight: 1.6 }}>
            <p>• 题目解析：约 50-100 积分/题</p>
            <p>• OCR 识别：约 80-150 积分/次</p>
            <p>• 生成纠错：约 100-200 积分/次</p>
            <p>• 实际消耗根据 Token 使用量计算</p>
          </div>
        </div>
        
        {/* 消费记录 */}
        <div className="mb-4">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'var(--fg2)' }}>最近消费记录</div>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--fg2)' }}>暂无消费记录</div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {transactions.slice(0, 10).map((tx: any, idx: number) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3"
                     style={{ borderBottom: idx < transactions.length - 1 ? '0.5px solid var(--sep)' : 'none' }}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'in' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {tx.type === 'in' ? <Zap size={14} className="text-green-600" /> : <Receipt size={14} className="text-red-500" />}
                    </div>
                    <div>
                      <div className="text-sm">{tx.description}</div>
                      <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--fg2)' }}>
                        <Clock size={10} /> {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'in' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 支付配置提示 */}
        <div className="rounded-lg p-3 text-xs text-center" style={{ background: 'rgba(0,122,255,0.08)', color: 'var(--blue)' }}>
          💡 提示：请配置易支付商户信息后即可开启充值功能
        </div>
      </div>
    </div>
  );
}
