import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// На телефонах :hover «залипает» после нажатия. Компоненты HeroUI (React Aria) дублируют его
// атрибутом data-hovered, который ставится только при наведении мышью, — поэтому :hover вырезаем
const stripHover = {
  postcssPlugin: 'strip-hover',
  Rule(rule) {
    if (!rule.selector.includes(':hover')) return
    const selectors = rule.selectors.filter((selector) => !selector.includes(':hover'))
    if (selectors.length) rule.selectors = selectors
    else rule.remove()
  },
}

// Название приложения на других языках: отдельный манифест на каждый язык,
// нужный подставляется в <link rel="manifest"> по языку (скрипт в index.html и src/App.jsx)
const MANIFEST_LOCALES = {
  be: {
    name: 'Расклад УА «ВДТК»',
    short_name: 'Расклад ВДТК',
    description: 'Зручны прагляд раскладу ВДТК',
    lang: 'be',
  },
  en: {
    name: 'Schedule VSTC',
    short_name: 'Schedule VSTC',
    description: 'A convenient way to view the VSTC schedule',
    lang: 'en',
  },
}

function localizedManifests(manifest) {
  const files = Object.entries(MANIFEST_LOCALES).map(([lang, overrides]) => ({
    fileName: `manifest-${lang}.webmanifest`,
    source: JSON.stringify({ ...manifest, ...overrides }),
  }))

  return {
    name: 'localized-manifests',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files.find(({ fileName }) => req.url === `/${fileName}`)
        if (!file) return next()
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(file.source)
      })
    },
    // VitePWA всегда ставит ссылку на русский манифест — её добавляет скрипт в index.html по языку
    transformIndexHtml: {
      order: 'post',
      handler: (html) => html.replace(/<link rel="manifest"[^>]*>/g, ''),
    },
    generateBundle() {
      for (const { fileName, source } of files) this.emitFile({ type: 'asset', fileName, source })
    },
  }
}

const manifest = {
  // Один id на все языки: иначе браузер посчитает их разными приложениями
  id: '/',
  name: 'Расписание УО \'ВГТК\'',
  short_name: 'Расписание ВГТК',

  icons: [
    {
      src: '/icons/pwalogo192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/pwalogo192.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icons/pwalogo180.png',
      sizes: '180x180',
      type: 'image/png',
      purpose: 'any'
    }
  ],

  display: 'standalone',
  display_override: ['standalone'],
  scope: '/',
  start_url: '/',
  description: 'PWA Web-App for comfortable viewing schedule from vgtk.by',
  theme_color: '#2f6f56',
  background_color: '#111111',
  orientation: 'portrait',
  categories: ['education', 'productivity'],
  lang: 'ru',
  prefer_related_applications: false,

  screenshots: [
    {
      src: '/screenshots/desktop.png',
      sizes: '1920x1080',
      type: 'image/png',
      form_factor: 'wide'
    },
    {
      src: '/screenshots/mobile.png',
      sizes: '1080x1920',
      type: 'image/png',
      form_factor: 'narrow'
    }
  ]
}

export default defineConfig(({ mode }) => {
  // Адрес бэкенда берётся из .env (не попадает в git); dev-сервер проксирует на него /api
  const env = loadEnv(mode, process.cwd(), '')
  const scheduleApi = env.SCHEDULE_API_URL ? new URL(env.SCHEDULE_API_URL) : null
  const trim = (pathname) => pathname.replace(/\/+$/, '')

  return {
    css: {
      postcss: { plugins: [stripHover] },
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        ...(scheduleApi && {
          '/api': {
            target: scheduleApi.origin,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, trim(scheduleApi.pathname)),
          },
        }),
      }
    },
    plugins: [tailwindcss(), react(), VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
      },
    
      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest,

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: false,
        type: 'module',
      },
    }), localizedManifests(manifest)],
  }
})
