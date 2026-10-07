'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AstrologerIndexPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && isAstrologer) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, isAstrologer, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
    </div>
  );
}
