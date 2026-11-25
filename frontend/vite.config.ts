import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

export default defineConfig({
    plugins: [react()],
    // evtl. Duplikate von Bibliotheken entfernen
    resolve: {
        dedupe: ['react', 'react-dom', 'react-router'],
    },
    server: {
        proxy: {
            "/api": "http://localhost:8080",
        },
    },
})
