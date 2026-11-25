import { withLocales } from "nextra/locales";
import { NextResponse } from "next/server";

const localize = withLocales(() => {});

export function middleware(req, event) {
  const { locale, pathname } = req.nextUrl;

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
  // Keep English access for the translated ULMS sections.
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
