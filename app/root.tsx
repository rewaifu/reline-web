import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import "./index.css"
import { Toaster } from "~/components/ui/toaster"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
        <script defer data-domain="cfg.yor.ovh" src="https://a.shd.llc/js/script.js" />
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
