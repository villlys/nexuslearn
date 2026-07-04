// vite.config.js
//aplicación web moderna construida con React que se ejecuta en el navegador
//Es la interfaz visual que ven los usuarios. 

import { defineConfig } from 'vite' // https://vitejs.dev/config/

import react from '@vitejs/plugin-react'// 
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
//Vite es el motor que hace funcionar 
// tu aplicación React de forma rápida 
// durante el desarrollo y la prepara para producción.