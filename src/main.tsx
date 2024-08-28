import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import "unfonts.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import HomePage from "./routes"
import { Toaster } from "./components/ui/toaster"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
])

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster />
    <RouterProvider router={router} />
  </React.StrictMode>,
)
