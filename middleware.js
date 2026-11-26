import { NextResponse } from "next/server";
import { withLocales } from "nextra/locales";

const docsMiddleware = withLocales(() => NextResponse.next());

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname === "/assistant") {
    return NextResponse.rewrite(new URL("/little-bee/index.html", request.url));
  }
  if (pathname.startsWith("/little-bee/")) return NextResponse.next();
  return docsMiddleware(request);
}
