/**
 * Compact version of the homepage hero's gradient -- every secondary
 * page (grades, homework, announcements, downloads, about, contact,
 * search) used to open with a flat white title and a lot of empty
 * space above the first card. This gives each one the same dark
 * navy-to-navy gradient band as the homepage, so the site reads as one
 * consistent design instead of "homepage looks designed, everything
 * else is a plain document."
 */
export function PageHeader({
  title,
  subtitle,
  maxWidth = "max-w-5xl",
  children,
}: {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-navy-900 to-navy-700 text-white px-6 py-10 mb-8">
      <div className={`${maxWidth} mx-auto`}>
        {children}
        <h1 className="text-2xl font-black">{title}</h1>
        {subtitle && <p className="text-navy-100 text-sm mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}
