'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function Header({ title, showBack = true, right }: HeaderProps) {
  const router = useRouter();
  
  return (
    <header className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '0.5px solid var(--sep)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 flex-1">
        {showBack && (
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </button>
        )}
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <div>{right}</div>
    </header>
  );
}
