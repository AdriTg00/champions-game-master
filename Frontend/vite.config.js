import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizaciones de build
  build: {
    // Reporta tamaño de archivos comprimidos
    reportCompressedSize: true,
    
    // Límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 500,
    
    // Configuración de Rollup para code splitting
    rollupOptions: {
      output: {
        // Separar dependencias grandes en chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'state-management': ['zustand'],
          'http-client': ['axios']
        }
      }
    },
    
    // Minificación avanzada
    minify: 'terser',
    terserOptions: {
      compress: {
        // Eliminar console.log en producción
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'axios']
  },
  
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // Preview (build preview)
  preview: {
    port: 4173,
    strictPort: true
  },
  
  // Prefijo para variables de entorno
  envPrefix: 'VITE_'
})
