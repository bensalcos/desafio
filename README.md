# APIUX LABS - Mini CRM Full Stack con IA

## Arquitectura
El sistema se divide en:
- **Frontend**: Next.js 15 (App Router), TailwindCSS, shadcn/ui. Arquitectura orientada a componentes de cliente para manejo dinámico de estados locales (filtros, dashboard, exportaciones CSV).
- **Backend**: Express.js, Prisma ORM y base de datos PostgreSQL. Cuenta con validación (Zod), middlewares de observabilidad (Morgan) y autenticación vía JWT.
- **Base de Datos**: PostgreSQL local dockerizado.

## Asistente de IA
El asistente de IA utiliza **OpenAI (`gpt-4o-mini`)** con una integración estricta de **Tool Calling (Function Calling)**.
- **Funcionamiento**: La IA no tiene acceso directo a la DB ni conocimiento pre-entrenado de los datos. En su lugar, cuando el usuario pregunta algo, la IA decide invocar funciones seguras del backend (`getOpportunitiesByStage`, etc.) que le inyectan contexto real y determinista.
- **Limitaciones de Seguridad y Alucinaciones**:
  1. El *System Prompt* fuerza a la IA a rechazar tajantemente cualquier pregunta fuera del contexto del CRM (ej: recetas, clima, inyecciones de código).
  2. La IA no puede inventar oportunidades. Sólo debe leer la información entregada por las herramientas.
  3. Las "tools" tienen acceso de solo lectura (`SELECT`). La IA no tiene la capacidad de realizar comandos destructivos (`DROP`, `DELETE`, `UPDATE`) en la base de datos, mitigando inyecciones SQL a través del lenguaje natural.

## Decisiones Técnicas Tomadas
- **Prisma ORM**: Por su fuerte tipado y facilidad de migraciones. Se usó Prisma v6 por estabilidad compatible con el setup actual.
- **JWT para Auth**: Solución rápida y escalable (stateless) para el requerimiento de roles.
- **Validación con Zod**: Asegura la integridad estructural de los datos recibidos antes de tocar el controlador.
- **CSV en Cliente**: Para evitar saturar el backend, la exportación a CSV se computa nativamente en el navegador usando JavaScript.

## Mejoras Futuras
- Implementar **RAG avanzado** utilizando *Embeddings* y *Vector Search* (pgvector) si los resúmenes o historiales de cliente crecen demasiado.
- WebSockets para actualización del chat o pipeline en tiempo real.
- Cacheo de consultas recurrentes a la IA usando Redis.

## Instrucciones de Instalación y Ejecución

### 1. Variables de Entorno (.env)
En la carpeta `backend`, crea o verifica el archivo `.env`:
```env
PORT=3001
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db?schema=public"
OPENAI_API_KEY="sk-proj-tu-api-key"
JWT_SECRET="secret_token_super_seguro"
```

### 2. Base de Datos
En la raíz del proyecto, inicia PostgreSQL:
```bash
docker compose up -d
```

### 3. Backend
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

### 4. Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
Accede a `http://localhost:3000`. Usando las credenciales definidas.

## Testing
Para correr las pruebas unitarias:
```bash
cd backend
npm test
```
