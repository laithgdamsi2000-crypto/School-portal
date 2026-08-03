# بنية المشروع — بوابة المدرسة الإلكترونية

## Step 1: Folder Structure

```
school-portal/
├── prisma/
│   ├── schema.prisma          # Database schema (single source of truth)
│   └── seed.ts                 # Initial data (admin user, default grades)
│
├── public/
│   ├── uploads/                 # Homework/announcement file storage (dev only;
│   │                            #   production uses cloud storage, see note below)
│   └── logo/
│
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── layout.tsx                          # Root layout — dir="rtl", lang="ar"
│   │   ├── page.tsx                            # Home page
│   │   ├── globals.css                         # Design tokens (colors, RTL rules)
│   │   │
│   │   ├── (public)/                           # Public, no-auth routes
│   │   │   ├── homework/page.tsx               # Browse/search all homework
│   │   │   ├── grades/
│   │   │   │   ├── page.tsx                    # Grade list
│   │   │   │   └── [gradeSlug]/page.tsx        # Single grade: homework+announcements+files
│   │   │   ├── announcements/page.tsx
│   │   │   ├── downloads/page.tsx              # File center
│   │   │   ├── about/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── admin/                              # Auth-protected dashboard
│   │   │   ├── layout.tsx                      # Checks session, renders sidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx                        # Dashboard home (stats, activity)
│   │   │   ├── homework/
│   │   │   │   ├── page.tsx                    # List + filters + pagination
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── announcements/ (same CRUD pattern)
│   │   │   ├── files/page.tsx                  # File manager
│   │   │   ├── grades/page.tsx                 # Manage grades/subjects/teachers
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/                                # Backend REST endpoints
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── homework/
│   │       │   ├── route.ts                    # GET (list/search), POST (create)
│   │       │   └── [id]/route.ts                # GET, PATCH, DELETE
│   │       ├── announcements/ (same pattern)
│   │       ├── files/
│   │       │   ├── upload/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── search/route.ts                 # Unified search endpoint
│   │       └── stats/route.ts
│   │
│   ├── components/
│   │   ├── ui/                # Buttons, Cards, Badge, Modal, Toast — design system atoms
│   │   ├── public/             # HomeworkCard, AnnouncementCard, HeroSection, GradeGrid
│   │   ├── dashboard/          # StatCard, DataTable, DashboardSidebar
│   │   └── forms/              # HomeworkForm, AnnouncementForm, FileUploader
│   │
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # NextAuth config (credentials provider, hashed password)
│   │   ├── validation.ts        # Zod schemas — input validation for every API route
│   │   ├── upload.ts            # File upload handling + type/size checks
│   │   └── notifications.ts     # Notification abstraction (see note below)
│   │
│   └── types/
│       └── index.ts             # Shared TypeScript types
│
├── middleware.ts                 # Protects /admin/* and /api/admin/* routes
├── .env.example
├── package.json
└── next.config.js
```

## Key architecture decisions

**1. Route groups separate public vs. admin cleanly.**
`(public)` pages need no auth and are what parents/students see. `admin/*` is
gated by `middleware.ts`, which checks the session on every request before
the page even renders — not just a client-side check.

**2. Every API route validates input with Zod before touching the database.**
This is the CSRF/XSS/SQL-injection defense line: Prisma parameterizes all
queries (no raw SQL = no injection surface), Zod rejects malformed/oversized
input before it reaches business logic, and React's JSX escaping handles XSS
on output by default (we avoid `dangerouslySetInnerHTML` entirely).

**3. Notifications are abstracted now, implemented later.**
`lib/notifications.ts` exports a `notify(event, payload)` function with a
single no-op implementation today. When email/SMS/push are ready, only this
file changes — nothing else in the codebase needs to know a notification
channel now exists. The `Notification` table (see schema) already logs
*intent* to notify, so historical data isn't lost by delaying the real send.

**4. Teacher/Parent/Student accounts slot in without restructuring.**
The schema already has `Teacher`, `Parent`, and `Student` tables with a
`userId`-style nullable link pattern (see schema notes) — they exist as
data records now (for display: "Teacher Name" on homework) and gain login
capability later just by adding a password field and an auth route, not by
redesigning relationships.

**5. File storage note.** For local development, files save to
`public/uploads/`. For production, swap `lib/upload.ts` to write to an
object store (e.g., Vercel Blob or S3-compatible storage) — the interface
(`uploadFile(file) → url`) stays identical, so this is a one-file change
when you're ready to deploy for real.
