import { ReactNode } from 'react';
import { StarBackground } from './StarBackground';
import { SteamiNav } from './SteamiNav';

export function SteamiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <StarBackground />
      <SteamiNav />
      <main className="pt-16 px-5 pb-20 max-w-[1200px] mx-auto">
        {children}
      </main>
    </div>
  );
}
