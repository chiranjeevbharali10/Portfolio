import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite module ids always use forward slashes, even on Windows.
const pkg = (names: string) => new RegExp(`node_modules/(${names})/`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Long-cacheable vendor chunks; only pulled in by the routes/components that need them.
        // A group also captures its dependencies, so React gets top priority to keep it
        // out of the three.js chunk (otherwise the landing page would preload three).
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: pkg('react|react-dom|react-router|react-router-dom|scheduler'), priority: 30 },
            { name: 'vendor-three', test: pkg('three|three-stdlib|@react-three/[^/]+|postprocessing|maath|camera-controls|troika-[^/]+|@monogrid/[^/]+|meshline|stats-gl|detect-gpu'), priority: 20 },
            { name: 'vendor-gsap', test: pkg('gsap|@gsap/[^/]+|lenis'), priority: 10 },
          ],
        },
      },
    },
  },
})
