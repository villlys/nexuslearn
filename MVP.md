# MVP — NexusLearn
## Producto Mínimo Viable

**Proyecto:** NexusLearn — Plataforma de gamificación inteligente para entornos educativos
**Fecha de revisión:** 20–21 de julio de 2026
**Estado:** Desplegado y funcional en producción

---

## 1. ¿Qué resuelve el MVP?

El MVP de NexusLearn permite validar el flujo completo de una plataforma educativa gamificada con IA: un profesor crea una actividad, agrega o genera preguntas con inteligencia artificial, y un alumno la resuelve mediante un quiz contrarreloj, acumulando XP y viendo su progreso.

## 2. Enlaces de acceso

| Recurso | URL |
|---|---|
| Aplicación (frontend) | https://nexuslearn-steel.vercel.app |
| API (backend) | https://nexuslearn-backend.onrender.com |
| Repositorio | https://github.com/villlys/nexuslearn |

> Nota: el backend gratuito en Render puede tardar hasta ~50 segundos en responder tras un periodo de inactividad (arranque en frío). Se recomienda esperar la primera carga.

## 3. Funcionalidades incluidas en el MVP

### Para el Alumno
- [x] Registro de cuenta (nombre, email institucional, contraseña)
- [x] Inicio de sesión
- [x] Selección de avatar (20 opciones)
- [x] Unirse a una actividad mediante código de acceso
- [x] Resolver quiz contrarreloj con temporizador visual
- [x] Recibir retroalimentación inmediata por pregunta
- [x] Acumular XP y subir de nivel
- [x] Generar preguntas de práctica adicionales con IA (Entrenador IA)
- [x] Consultar historial de respuestas y logros
- [x] Ver gráfica de progreso por actividad

### Para el Profesor
- [x] Cuenta creada de forma administrativa (vía API)
- [x] Inicio de sesión
- [x] Crear actividades gamificadas (título, descripción, código de acceso)
- [x] Agregar preguntas manualmente
- [x] Consultar el listado de sus actividades
- [x] Ver estadísticas de desempeño por actividad (aciertos, intentos, gráfica por pregunta)
- [x] Eliminar actividades y preguntas (con validación de propiedad)

### Infraestructura
- [x] Base de datos relacional PostgreSQL con 4 tablas e integridad referencial
- [x] API REST documentada
- [x] Autenticación JWT y hash de contraseñas con bcrypt
- [x] Despliegue en la nube (Vercel + Render)
- [x] Diseño responsivo (funcional en dispositivos móviles)

## 4. Fuera del MVP (explícitamente no incluido)

- Sistema de racha de días consecutivos (solo visual, sin lógica)
- Modalidad de evaluación tipo Flashcard (prevista en el esquema de datos, no implementada)
- Generación de preguntas con IA desde el Panel del Profesor (disponible solo para el alumno actualmente)
- Adaptación dinámica de dificultad según desempeño histórico
- Modo multijugador en tiempo real
- Analítica predictiva avanzada

## 5. Flujo de demostración sugerido (para la revisión)

1. **Registro de alumno** → crear cuenta nueva desde la pantalla de registro.
2. **Login de profesor** (cuenta ya provisionada) → acceder al Panel del Profesor.
3. **Creación de actividad** → título, descripción y código de acceso, con al menos una pregunta agregada manualmente.
4. **Login de alumno** → unirse a la actividad con el código generado.
5. **Resolución del quiz** → responder al menos una pregunta, observar el temporizador, el cálculo de XP y la retroalimentación.
6. **Uso del Entrenador IA (alumno)** → ingresar un tema y confirmar que se generan preguntas de práctica adicionales automáticamente.
7. **Consulta de progreso** → revisar el Dashboard del Alumno (historial, XP, nivel).
8. **Consulta de estadísticas** → volver al Panel del Profesor y revisar el detalle de la actividad con la gráfica de rendimiento.

## 6. Validación técnica realizada

- Pruebas funcionales de todos los endpoints mediante Postman (registro, login, CRUD de actividades y preguntas, generación con IA, respuesta de quiz).
- Pruebas de seguridad: validación de autorización por rol, prevención de acceso indebido a recursos (IDOR).
- Pruebas de manejo de errores: verificado el comportamiento del sistema ante fallos temporales de la API de Gemini (error 503), confirmando que el sistema responde con un mensaje claro en lugar de fallar de forma abrupta.
- Pruebas de sesiones simultáneas con múltiples usuarios conectados en paralelo.
- Verificación cruzada en base de datos (pgAdmin) de cada operación realizada desde la interfaz o la API.
- Verificación del manejo de errores de validación: al enviar un rol inválido en el registro, el sistema responde correctamente con un código HTTP 400 (Bad Request) y un mensaje descriptivo, en lugar de un error genérico 500.

## 7. Próximos pasos posteriores al MVP

1. Extender la generación de preguntas con IA al Panel del Profesor.
2. Implementar el sistema de racha de participación consecutiva.
3. Evaluar la migración de la base de datos antes de su expiración (13 de agosto de 2026) o la actualización a un plan de pago en Render.
4. Explorar la incorporación de un motor de adaptación dinámica de dificultad basado en el historial de respuestas ya almacenado.
