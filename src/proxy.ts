import { type NextRequest, NextResponse } from 'next/server';

import { hasLocale } from 'next-intl';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@/shared/i18n';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

    if (cookieLocale && hasLocale(routing.locales, cookieLocale)) {
      const url = request.nextUrl.clone();

      url.pathname = `/${cookieLocale}`;

      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(uk|en)/:path*', '/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
