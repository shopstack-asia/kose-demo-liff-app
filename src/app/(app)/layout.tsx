'use client';

import { RouteGuard } from '@/components/routing/route_guard';
import { AppLayout } from '@/components/layout/app_layout';

/**
 * App Layout - Wraps protected routes (/home, /purchase, /coupon, /profile)
 * 
 * Uses RouteGuard as single source of truth for authentication.
 * RouteGuard handles all redirect logic - this layout just wraps children.
 */
export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <AppLayout>{children}</AppLayout>
    </RouteGuard>
  );
}
