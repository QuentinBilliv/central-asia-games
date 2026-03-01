import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  // Cookie already set with a valid locale — pass through
  if (cookieLocale && routing.locales.includes(cookieLocale as any)) {
    return NextResponse.next();
  }

  // Detect from Accept-Language header
  const acceptLang = request.headers.get('Accept-Language') || '';
  const detected = routing.locales.find((loc) => acceptLang.includes(loc)) || routing.defaultLocale;

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', detected, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
