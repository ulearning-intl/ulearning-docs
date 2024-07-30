import { useRouter } from 'next/router';
import { LocaleSwitch, ThemeSwitch } from 'nextra-theme-docs';

export default function Footer() {
  const router = useRouter()
  const indexPage = router.route.startsWith('/index')

  return (
    <>
      {
        indexPage && <footer className="nx-bg-gray-100 nx-pb-[env(safe-area-inset-bottom)] dark:nx-bg-neutral-900 print:nx-bg-transparent fixed bottom-0 left-0 right-0">
          <div className="nx-mx-auto nx-flex nx-max-w-[90rem] nx-gap-2 nx-py-2 nx-px-4 nx-flex">
            <LocaleSwitch></LocaleSwitch>
            <ThemeSwitch></ThemeSwitch>
          </div>
        </footer>
      }
    </>
  )
}