'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Root Page - ONLY handles redirect from "/" to "/home"
 * 
 * HARD REQUIREMENT: Root path "/" MUST ONLY redirect to "/home". Nothing else.
 * NO PAGE is allowed to redirect to "/". Remove all such logic.
 */
export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ONLY redirect if on root path
    if (pathname === '/' || pathname === '') {
      router.replace('/home');
    }
  }, [pathname, router]);

  // Don't render anything - just redirect
  return null;
}
