'use client';

import { useEffect, useState } from 'react';

let globalToast: (msg: string) => void;

export function showToast(msg: string) {
  if (globalToast) globalToast(msg);
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    globalToast = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1001] px-5 py-2 rounded-full text-white text-sm font-medium whitespace-nowrap"
         style={{
           background: 'rgba(29,29,31,0.92)',
           backdropFilter: 'blur(10px)',
           animation: 'toastIn 0.3s ease',
         }}>
      {message}
    </div>
  );
}
