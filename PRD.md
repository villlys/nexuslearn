# PRD — NexusLearn
## Documento de Requisitos del Producto

**Proyecto:** Plataforma de gamificación inteligente para entornos educativos con adaptación dinámica de retos
**Alumna:** Ana Cecilia Villarreal Meléndez — TSU en Tecnologías de la Información, UTSLP
**Empresa:** PluriOne S.A. de C.V. (Develop Talent & Technology)
**Líder de Proyecto:** Edgar Loheffemman
**Asesor Empresarial:** Juan Méndez Herrera
**Fecha:** Julio 2026
**Versión:** 1.0

---

## 1. Resumen Ejecutivo

NexusLearn es una plataforma web educativa gamificada que combina mecánicas de motivación intrínseca —puntos de experiencia, niveles y retroalimentación inmediata— con generación automática de contenido evaluativo mediante inteligencia artificial (Google Gemini). Está dirigida a profesores, que crean y gestionan actividades de evaluación, y alumnos, que las resuelven mediante un quiz contrarreloj gamificado.

El sistema está **100% desarrollado, desplegado y funcional** en producción:
- Frontend: `https://nexuslearn-steel.vercel.app`
- Backend: `https://nexuslearn-backend.onrender.com`
- Repositorio: `https://github.com/villlys/nexuslearn`

---

## 2. Problema a Resolver

Herramientas ampliamente utilizadas como Kahoot, Google Forms y Moodle son funcionales para la evaluación básica de conocimientos, pero presentan limitaciones:

- No cuentan con mecanismos de personalización basados en el desempeño individual del alumno.
- No proporcionan al docente información analítica detallada sobre el progreso de cada estudiante.
- Los alumnos pierden motivación al no recibir retroalimentación inmediata y significativa.
- Los docentes carecen de herramientas ágiles para crear actividades evaluativas enriquecidas.

## 3. Objetivo del Producto

Ofrecer una plataforma que permita a los alumnos practicar contenidos de forma interactiva y motivadora, con retroalimentación inmediata y progresión por puntos de experiencia, mientras facilita al docente la creación y gestión de actividades evaluativas con apoyo de inteligencia artificial.

## 4. Usuarios y Roles

| Rol | Descripción | Permisos principales |
|---|---|---|
| **Alumno** | Se autorregistra en la plataforma | Unirse a actividades por código, responder quiz contrarreloj, acumular XP y nivel, generar preguntas de práctica con IA (Entrenador IA), consultar historial y progreso |
| **Profesor** | Se registra de forma administrativa (vía API, gestionado por el administrador del sistema) | Crear y gestionar actividades gamificadas, agregar preguntas manualmente, consultar estadísticas de desempeño de sus alumnos |

## 5. Funcionalidades Principales (Implementadas)

1. **Autenticación y autorización** — Registro y login con JWT (24h de expiración) y bcrypt para el hash de contraseñas. Verificación de rol mediante middleware (`verificarToken`, `verificarProfesor`).
2. **Gestión de actividades gamificadas** — CRUD completo para el profesor: creación con código de acceso único, listado, detalle con estadísticas, eliminación con validación de propiedad (anti-IDOR).
3. **Banco de preguntas** — Creación manual o mediante generación automática con IA; opción múltiple con retroalimentación por pregunta.
4. **Generación automática de preguntas con IA (Entrenador IA)** — Disponible actualmente para el alumno: integración con Google Gemini (`gemini-2.5-flash`) que, a partir de un tema, genera un conjunto de preguntas de práctica con opciones, respuesta correcta y retroalimentación en formato JSON.
5. **Quiz contrarreloj** — Temporizador visual (25s), cálculo dinámico de XP según tiempo de respuesta, retroalimentación inmediata.
6. **Sistema de XP y niveles** — Fórmula de puntuación con penalización proporcional al tiempo, mínimo garantizado de 50 XP por respuesta correcta.
7. **Dashboard de progreso del alumno** — Misiones, historial de respuestas, gráfica de rendimiento por actividad, selector de avatar (20 opciones).
8. **Panel de estadísticas del profesor** — Porcentaje de aciertos global, intentos totales, gráfica de rendimiento por pregunta (SVG propio).
9. **Despliegue en la nube** — Frontend en Vercel, backend y base de datos en Render, con variables de entorno seguras.

## 6. Funcionalidades Fuera de Alcance (Trabajo Futuro)

| Funcionalidad | Estado |
|---|---|
| Sistema de racha de días consecutivos | Elemento visual preparado en la interfaz; sin lógica funcional |
| Modalidad de evaluación tipo Flashcard | Estructura de datos prevista en el esquema (`CHECK` del campo `tipo`); no implementada |
| Generación de preguntas con IA para el profesor (Panel del Profesor) | Disponible actualmente solo para el alumno (Entrenador IA); extensión planeada |
| Adaptación dinámica de dificultad / analítica predictiva | El historial detallado de respuestas sienta las bases para una futura iteración hacia un Sistema Tutor Inteligente |
| Modo multijugador en tiempo real | No contemplado en el alcance actual |
| Tipos de juego adicionales (Drag & Drop, Fill in the Blanks) | No contemplados en el alcance actual |

## 7. Requisitos Técnicos

**Stack tecnológico:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: PostgreSQL (relacional, 4 tablas)
- IA: Google Gemini API (modelo `gemini-2.5-flash`)
- Despliegue: Vercel (frontend) + Render (backend y base de datos)

**Modelo de datos (resumen):**
- `USUARIOS` — id, nombre, email, password_hash, rol, xp_total, nivel_actual, avatar, fecha_registro
- `ACTIVIDADES_GAMIFICADAS` — id, titulo, descripcion, id_profesor (FK), codigo_acceso, fecha_creacion
- `PREGUNTAS` — id, id_actividad (FK), tipo, enunciado, opciones, respuesta_correcta, retroalimentacion, generada_por_ia
- `HISTORIAL_RESPUESTAS` — id, id_alumno (FK), id_pregunta (FK), respuesta_dada, es_correcta, tiempo_empleado, puntos_ganados, fecha_registro

**Seguridad implementada:**
- Hash de contraseñas con bcrypt
- Autenticación mediante JWT
- Autorización basada en roles (middleware `verificarProfesor`)
- Validación anti-IDOR en endpoints de eliminación
- Manejo diferenciado de errores en el registro de usuarios: validación de datos de entrada con respuesta HTTP 400 (Bad Request) ante valores inválidos, como un rol no reconocido, evitando que estos casos se reporten como error genérico 500
- Variables de entorno para credenciales sensibles (nunca expuestas en el repositorio)

## 8. Métricas de Éxito

- Sistema desplegado y accesible públicamente sin errores críticos.
- Flujo completo funcional: registro → login → creación de actividad → generación/adición de preguntas → resolución de quiz → cálculo de XP → consulta de progreso.
- Tiempo de generación de preguntas con IA menor al de la creación manual equivalente.
- Cero vulnerabilidades de acceso indebido (IDOR) detectadas en pruebas de seguridad.

## 9. Cronograma General

| Sprint | Período | Entregable |
|---|---|---|
| Sprint 1 | 11 may – 27 jun | Base de datos y API REST con autenticación completa |
| Sprint 2 | 28 jun – 18 jul | Frontend React con Quiz gamificado funcional |
| Sprint 3 | 19 jul – 1 ago | Integración de IA y dashboard de progreso |
| Sprint 4 | 2 ago – 14 ago | Pruebas, despliegue en la nube y documentación final |

## 10. Riesgos y Consideraciones

- La base de datos gratuita en Render expira el 13 de agosto de 2026; requiere renovación o migración para continuidad más allá de la entrega.
- El servicio backend gratuito en Render puede presentar inactividad tras periodos sin uso, generando una demora inicial de hasta 50 segundos en la primera petición.
- La API de Google Gemini puede presentar errores de disponibilidad temporal (503) bajo alta demanda; el sistema maneja este escenario mostrando un mensaje de error claro al usuario sin fallos abruptos.
