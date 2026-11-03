import { withLocales } from "nextra/locales";

export const middleware = withLocales((req) => {
  // do something ...
});

// Nextra's locale middleware does not exclude GIF assets by default.
export const config = {
  matcher: ["/((?!.*\\.gif$).*)"],
};
