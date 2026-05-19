"use client";

import { StudioSubNav } from "@/components/studio/StudioSubNav";

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <StudioSubNav />
      {children}
    </div>
  );
}
