import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css";
// @ts-expect-error
import { ClippyProvider } from "@react95/clippy";
import { ColumnProvider } from "./utils/ColumnProvider";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Data from Scratch",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ClippyProvider>
          <ColumnProvider>
            <Outlet />
          </ColumnProvider>
        </ClippyProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
