import { NextResponse } from "next/server";
import { withLocales } from "nextra/locales";

const localize = withLocales(() => NextResponse.next());

export function middleware(req, event) {
  const { locale, pathname } = req.nextUrl;

  if (pathname === "/assistant") {
    return NextResponse.rewrite(new URL("/little-bee/index.html", req.url));
  }
  if (pathname.startsWith("/little-bee/")) return NextResponse.next();

  const isUClassStart =
    /^\/uclass\/start\/?$/.test(pathname);

  const isEnglishUlmsGuide =
    locale === "en-US" &&
    /^\/ulms\/(?:quick-start|student|teacher)(?:\/|$)/.test(pathname);

  const isEnglishUClassGuide =
    locale === "en-US" &&
    /^\/uclass\/(?:quick-start|teacher)(?:\/|$)/.test(pathname);

  const isEnglishUAgentGuide =
    locale === "en-US" &&
    /^\/uagent\/(?:quick-start|teacher|administrator)(?:\/|$)/.test(pathname);

  // Redirect untranslated product guides to Chinese.
  // Keep English access for the translated product sections.
  if (
    locale !== "zh-CN" &&
    /^\/(ulms|uclass|uagent)(\/|$)/.test(pathname) &&
    !isUClassStart &&
    !isEnglishUlmsGuide &&
    !isEnglishUClassGuide &&
    !isEnglishUAgentGuide
  ) {
    const url = req.nextUrl.clone();
    url.locale = "zh-CN";

    if (req.headers.has("x-nextjs-data")) {
      return NextResponse.json(
        {},
        {
          headers: {
            "x-nextjs-redirect": url.toString(),
          },
        }
      );
    }

    return NextResponse.redirect(url);
  }

  return localize(req, event);
}

// Exclude GIF and WebM assets from locale middleware.
export const config = {
  matcher: ["/((?!.*\\.(?:gif|webm)$).*)"],
};
