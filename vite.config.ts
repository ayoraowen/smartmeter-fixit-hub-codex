// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";
// import fs from "fs";
// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     https: {
//       key: fs.readFileSync("./certs/localhost.key"),
//       cert: fs.readFileSync("./certs/localhost.crt"),
//     },
//     port: 8080,
//   },
//   plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

const CERT_KEY = "./certs/localhost.key";
const CERT_FILE = "./certs/localhost.crt";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const env = loadEnv(mode, process.cwd(), "");

  // Serve over HTTPS when local certs exist; set DEV_HTTPS=false to force plain HTTP
  const useHttps =
    env.DEV_HTTPS !== "false" && fs.existsSync(CERT_KEY) && fs.existsSync(CERT_FILE);

  return {
    server: isDev
      ? {
          host: "::",
          port: 8080,
          https: useHttps
            ? {
                key: fs.readFileSync(CERT_KEY),
                cert: fs.readFileSync(CERT_FILE),
              }
            : undefined,
        }
      : undefined, // ⬅️ IMPORTANT: no dev server config in prod

    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});