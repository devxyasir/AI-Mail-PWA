'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, RotateCcw, ExternalLink } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  onUndo?: () => void;
  onView?: () => void;
  duration?: number;
}

export function NotificationToast({ 
  message, 
  show, 
  onClose, 
  onUndo, 
  onView, 
  duration = 5000 
}: NotificationToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show && !visible) return null;

  return (
    <div className={`
      fixed bottom-fib-21 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-fib-13
      transition-all duration-300 transform
      ${visible ? 'translate-y-0 opacity-100' : 'translate-y-fib-21 opacity-0'}
    `}>
      <div className="bg-primary text-on-primary border border-outline-variant shadow-2xl p-fib-13 flex items-center justify-between gap-fib-21">
        <div className="flex items-center gap-fib-13">
          <CheckCircle className="h-fib-21 w-fib-21 text-secondary" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{message}</span>
        </div>
        
        <div className="flex items-center gap-fib-5">
          {onUndo && (
            <button 
              onClick={() => {
                onUndo();
                setVisible(false);
                onClose();
              }}
              className="flex items-center gap-fib-5 px-fib-13 py-fib-5 text-[10px] font-mono font-bold uppercase tracking-tighter hover:bg-on-primary/10 transition-colors"
            >
              <RotateCcw className="h-fib-13 w-fib-13" />
              Undo
            </button>
          )}
          {onView && (
            <button 
              onClick={() => {
                onView();
                setVisible(false);
                onClose();
              }}
              className="flex items-center gap-fib-5 px-fib-13 py-fib-5 text-[10px] font-mono font-bold uppercase tracking-tighter hover:bg-on-primary/10 transition-colors"
            >
              <ExternalLink className="h-fib-13 w-fib-13" />
              View
            </button>
          )}
          <button onClick={() => setVisible(false)} className="p-fib-5 hover:bg-on-primary/10 transition-colors">
            <X className="h-fib-13 w-fib-13" />
          </button>
        </div>
      </div>
    </div>
  );
}
