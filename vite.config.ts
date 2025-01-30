// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext', //browsers can handle the latest ES features
        rollupOptions: {
            output: {
                format: 'es' // Use 'es' for ES Modules format
            }
        }
    }
})