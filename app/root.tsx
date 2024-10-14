import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import "./index.css"
import { Toaster } from "~/components/ui/toaster"
import type { LinksFunction } from "@remix-run/node"
import type { ReactNode } from "react"

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
