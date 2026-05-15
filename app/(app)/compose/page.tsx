'use client';

import React from 'react';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { useRouter } from 'next/navigation';

export default function ComposePage() {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center bg-surface-container">
      <ComposeModal onClose={() => router.back()} />
    </div>
  );
}
