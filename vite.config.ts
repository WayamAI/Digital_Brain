import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Nitro turns the TanStack Start build into a deployable server. It is a
// build-only plugin — pulling it in during `vite dev` breaks HMR.
// `node-server` emits .output/server/index.mjs, which is what the Dockerfile
// runs. Vercel sets its own `VERCEL` env var during builds, so default to
// the `vercel` preset there (writes `.vercel/output`, Vercel's Build Output
// API — zero extra config needed) and `node-server` everywhere else.
// Override either default with NITRO_PRESET.
const NITRO_PRESET =
  process.env["NITRO_PRESET"] ?? (process.env["VERCEL"] ? "vercel" : "node-server");

export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Route the bundled server entry through src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      // Fail the build if server-only code is pulled into a client bundle.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: NITRO_PRESET }));
  }

  plugins.push(viteReact());

  return {
    css: { transformer: "lightningcss" as const },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      // One copy of React and Query, or hooks blow up across chunk boundaries.
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: true, port: 8080 },
    preview: { host: true, port: 8080 },
    plugins,
  };
});
