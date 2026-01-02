'use client';

import { GatedLayout } from '@/components/layout/gated_layout';

export default function GatedLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GatedLayout>{children}</GatedLayout>;
}


