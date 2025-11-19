import { defineConfig, loadEnv } from 'vite'
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  // Load env variables based on current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  base: '/manage/', // ✅ base route
  server: {
    host: true,
    // port: 5173,
    allowedHosts: [
      'host.docker.internal', // ✅ allow proxy host
    ],
    proxy: {
      "/manage/llm": {
        target: env.VITE_LMSTUDIO_BASEURL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/manage/, ''), // remove /api prefix
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Add your auth header here
            proxyReq.setHeader("Authorization", `Bearer ${env.VITE_LMSTUDIO_TOKEN}`);
          });
        },
      },
      "/manage/system": {
        target: env.VITE_LMSTUDIO_BASEURL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/manage/, ''), // remove /api prefix
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Add your auth header here
            proxyReq.setHeader("Authorization", `Bearer ${env.VITE_LMSTUDIO_TOKEN}`);
          });
        },
      },
    },
  },
}
});
