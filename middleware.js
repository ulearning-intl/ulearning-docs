import { withLocales } from "nextra/locales";
import { NextResponse } from "next/server";

const localize = withLocales(() => {});

export function middleware(req, event) {
  const { locale, pathname } = req.nextUrl;
  // The new product guides currently have Chinese content only. Keep the
  // existing translated uClass start pages and use Chinese for other guides.
  if (
    locale !== "zh-CN" &&
    /^\/(ulms|uclass|uagent)(\/|$)/.test(pathname) &&
    !/^\/uclass\/start\/?$/.test(pathname)
  ) {
    const url = req.nextUrl.clone();
    url.locale = "zh-CN";
    // Next 13 can prepend the current locale to relative data redirects.
    // An absolute destination makes client navigation switch locale as well.
    if (req.headers.has("x-nextjs-data")) {
      return NextResponse.json({}, {
        headers: { "x-nextjs-redirect": url.toString() },
      });
    }
    return NextResponse.redirect(url);
  }
  return localize(req, event);
}

// Nextra's locale middleware does not exclude GIF assets by default.
export const config = {
  matcher: ["/((?!.*\\.gif$).*)"],
};
