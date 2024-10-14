import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react"
import "./index.css"
import { Toaster } from "~/components/ui/toaster"
import type { LinksFunction } from "@remix-run/node"
import type { ReactNode } from "react"
import { Button } from "~/components/ui/button"

export const links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
      sizes: "any",
    },
  ]
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script defer data-domain="configurator.yor.ovh" src="https://a.shd.llc/js/script.js" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError() as { status?: number; data: string }

  return error.status ? (
    <main className="fixed left-1/2 top-1/2 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 p-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[2.5rem]">{error.status}</h1>
        <p className="mb-6 text-muted-foreground text-center">{error.data}</p>
        <Button asChild>
          <Link to="/">Go back</Link>
        </Button>
      </div>
    </main>
  ) : (
    <main className="fixed left-1/2 top-1/2 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 p-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[2.5rem]">500</h1>
        <p className="mb-6 text-muted-foreground text-center">Ошибка на стороне сервера. Попробуйте позже</p>
        <Button asChild>
          <Link to="/">Go back</Link>
        </Button>
      </div>
    </main>
  )
}
