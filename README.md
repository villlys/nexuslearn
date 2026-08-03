# NexusLearn

Plataforma de gamificación inteligente para entornos educativos con integración de inteligencia artificial.

## 🔗 Enlaces

- **Aplicación en producción:** https://nexuslearn-steel.vercel.app
- **API en producción:** https://nexuslearn-backend.onrender.com
- **Repositorio:** https://github.com/villlys/nexuslearn

## 🧰 Stack Tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL
- **IA:** Google Gemini API (`gemini-2.5-flash`)
- **Despliegue:** Vercel (frontend) + Render (backend y base de datos)

## 📋 Requisitos previos

- Node.js v24.16.0 o superior
- PostgreSQL 16 o superior
- Una clave de API de Google Gemini (obtenida en [Google AI Studio](https://aistudio.google.com/api-keys))

## ⚙️ Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/villlys/nexuslearn.git
cd nexuslearn
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` dentro de la carpeta `backend` (utiliza el archivo `.env.example` como referencia) con las siguientes variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexuslearn
DB_USER=postgres
DB_PASSWORD=tu_contraseña_local
DATABASE_URL=postgres://postgres:tu_contraseña_local@localhost:5432/nexuslearn
JWT_SECRET=una_clave_secreta_cualquiera
GEMINI_API_KEY=tu_clave_de_google_gemini
PORT=3000
```

Crea la base de datos en PostgreSQL y ejecuta el script SQL de creación de tablas (disponible en la documentación técnica del proyecto).

Levanta el servidor:

```bash
npm start
```

El backend correrá en `http://localhost:3000`.

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crea un archivo `.env` dentro de la carpeta `frontend` con:

```env
VITE_API_URL=http://localhost:3000
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

El frontend correrá en `http://localhost:5173`.

## 🗂️ Estructura del proyecto

```
nexuslearn/
├── backend/
│   ├── routes/          # Endpoints de la API REST
│   ├── middleware/      # Autenticación y autorización (JWT)
│   ├── services/        # Integración con Google Gemini
│   ├── db.js            # Conexión a PostgreSQL
│   └── index.js         # Punto de entrada del servidor
├── frontend/
│   └── src/
│       ├── components/  # Componentes de React
│       └── utils/       # Utilidades (manejo de sesión)
├── PRD.md
├── MVP.md
└── README.md
```

## 👤 Roles del sistema

- **Alumno:** Se registra desde la interfaz pública, resuelve actividades gamificadas y genera preguntas de práctica con IA (Entrenador IA).
- **Profesor:** Se registra de forma administrativa (vía API), crea y gestiona actividades y preguntas.

## 📄 Documentación adicional

La documentación técnica completa (arquitectura, base de datos, endpoints, manual de usuario) se encuentra en el reporte de estadía profesional del proyecto. El `PRD.md` y el `MVP.md` incluidos en este repositorio describen los requisitos del producto y el alcance funcional actual del sistema.

## 👩‍💻 Autora

Ana Cecilia Villarreal Meléndez — TSU en Tecnologías de la Información, UTSLP  
Desarrollado como parte de la estadía profesional en PluriOne S.A. de C.V. (Develop Talent & Technology)
