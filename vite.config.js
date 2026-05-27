import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview',
          },
        },
      }),
      ...(isElectron
        ? [
            electron([
              {
                entry: 'electron/main.js',
              },
              {
                entry: 'electron/preload.js',
                onstart(args) {
                  args.reload()
                },
              },
              {
                entry: 'electron/webview-preload.js',
                onstart(args) {
                  args.reload()
                },
              },
            ]),
            renderer(),
          ]
        : []),
    ],
  }
})
