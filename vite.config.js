import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: "base" debe ser "/NOMBRE-DE-TU-REPO/".
// Si nombras tu repositorio de GitHub exactamente "nutridash", no cambies nada.
// Si le pones otro nombre, cambia el valor de abajo para que coincida.
export default defineConfig({
  plugins: [react()],
  base: "/nutridash/",
});
