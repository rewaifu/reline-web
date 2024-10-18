import { createThemeSessionResolver } from "remix-themes"
import { createCookieSessionStorage } from "@remix-run/node"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    ...(process.env.NODE_ENV === "production" ? { domain: "configurator.yor.ovh", secure: true } : {}),
  },
})

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)
