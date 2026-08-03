"use client";

import { usePathname } from "next/navigation";

/**
 * Re-plays the same fade-in-up entrance used on the homepage hero
 * (see tailwind.config.js's fade-in-up keyframe) on every route change,
 * by keying a wrapper div on the pathname -- changing the key forces
 * React to remount the div, and the CSS animation plays again on
 * mount. No routing/animation library, no client-side page-fetch
 * logic -- Next.js still does normal server-rendered navigation, this
 * just gives the new page's content a subtle entrance instead of
 * popping in instantly.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}
