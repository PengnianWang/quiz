'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, Heart, Settings, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/wrongbook', icon: BookOpen, label: '错题' },
  { path: '/favorites', icon: Heart, label: '收藏' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  // 登录/注册页不显示导航
  if (pathname === '/login' || pathname === '/register') return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-[56px] max-w-[480px] mx-auto"
         style={{
           background: 'rgba(247,248,250,0.92)',
           backdropFilter: 'blur(24px) saturate(180%)',
           borderTop: '0.5px solid var(--sep)',
           paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 4px))',
         }}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full ${
              isActive ? 'text-[var(--fg)] font-semibold' : 'text-[var(--fg2)]'
            }`}
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
              isActive ? 'bg-[var(--fg)]' : 'bg-transparent'
            }`}>
              <Icon size={18} strokeWidth={1.6} className={isActive ? 'text-[var(--bg)]' : ''} />
            </div>
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
