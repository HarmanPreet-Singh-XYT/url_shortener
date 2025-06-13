'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', { user: !!user, isLoading });
    
    if (!isLoading && !user) {
      console.log('🚫 No user found, redirecting to login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    console.log('⏳ Auth still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user, should redirect...');
    return null;
  }

  console.log('✅ User authenticated, rendering protected content');
  return <>{children}</>;
}