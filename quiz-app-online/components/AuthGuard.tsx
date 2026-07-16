'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      const publicPaths = ['/login', '/register'];
      
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, [pathname, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--fg2)] text-sm">加载中...</div>
      </div>
    );
  }
  
  return <>{children}</>;
}
