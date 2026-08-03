import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageTransition } from "@/components/ui/PageTransition";

/**
 * Wraps every page under (public) — a route group, so it doesn't add
 * "/(public)" to any URL. /admin/* is a sibling of this group, not nested
 * inside it, so admin pages correctly get their own sidebar layout
 * instead of this header/footer.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <PageTransition>{children}</PageTransition>
      <PublicFooter />
    </>
  );
}
