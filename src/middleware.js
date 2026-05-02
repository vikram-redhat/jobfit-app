import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except public pages).
  // SEO/GEO files (robots.txt, sitemap.xml, llms.txt, llms-full.txt) MUST be
  // public — search engines and AI crawlers fetch them anonymously.
  const publicPaths = [
    '/',
    '/auth/callback',
    '/privacy',
    '/contact',
    '/api/contact',
    '/api/stripe/webhook',
    '/forgot-password',
    '/reset-password',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/og.png',
  ];
  // Prefix-matched public paths — anything under these is anonymous-accessible.
  // /tools/* hosts the free SEO tools and their indexable result permalinks;
  // /api/tools/* hosts their JSON endpoints.
  const publicPrefixes = ['/tools', '/api/tools'];

  const path = request.nextUrl.pathname;
  const isPublic =
    publicPaths.some((p) => path === p) ||
    publicPrefixes.some((p) => path === p || path.startsWith(p + '/'));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login page
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
