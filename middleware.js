import { withLocales } from "nextra/locales";
import { NextResponse } from "next/server";

const localize = withLocales(() => {});

export function middleware(req, event) {
  const { locale, pathname } = req.nextUrl;

  // Redirect untranslated product guides to Chinese.
  // English is currently available for uClass start and ULMS quick start.
  if (
    locale !== "zh-CN" &&
    /^\/(ulms|uclass|uagent)(\/|$)/.test(pathname) &&
    !/^\/uclass\/start\/?$/.test(pathname) &&
    !/^\/ulms\/quick-start(?:\/|$)/.test(pathname)
  ) {
    const url = req.nextUrl.clone();
    url.locale = "zh-CN";

    if (req.headers.has("x-nextjs-data")) {
      return NextResponse.json(
        {},
        {
          headers: { "x-nextjs-redirect": url.toString() },
        }
      );
    }

    return NextResponse.redirect(url);
  }

  return localize(req, event);
}

// Nextra's locale middleware does not exclude GIF or WebM assets by default.
export const config = {
  matcher: ["/((?!.*\\.(?:gif|webm)$).*)"],
};