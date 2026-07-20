# NutriDash

App personal de nutrición y entrenamiento. Guarda todos los datos en el propio
dispositivo (`localStorage`), sin cuentas ni servidor.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub llamado **`nutridash`** (si le pones
   otro nombre, edita `base` en `vite.config.js` y `start_url`/`scope` en
   `public/manifest.json` para que coincidan).
2. Sube todo el contenido de esta carpeta a ese repositorio.
3. En el repo: **Settings → Pages → Source → GitHub Actions**.
4. Con cualquier push a `main`, el workflow en `.github/workflows/deploy.yml`
   compila el proyecto y lo publica solo. La URL queda en
   `https://TU-USUARIO.github.io/nutridash/`.
5. Desde el celular, abre esa URL en Chrome → menú (⋮) → "Instalar app".

## Desarrollo local (opcional)

```
npm install
npm run dev
```
