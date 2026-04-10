# SicSemper Frontend

Frontend de SicSemper con Next.js App Router.

## Stack

- Next.js 16 + React 19 + TypeScript estricto.
- Tailwind CSS 4.
- Zustand para estado.
- React Hook Form + Zod para formularios/validacion.
- Capa de servicios alineada con OpenAPI del backend.

## Arquitectura

El proyecto esta organizado por capas en `src/`:

- `domain/`: tipos y reglas del dominio.
- `application/`: servicios de negocio por modulo (auth/admin/judge/participant).
- `infrastructure/`: cliente HTTP, contratos API y utilidades de integracion.
- `presentation/`: componentes, hooks y stores.
- `core/`: configuracion y utilidades base.

Rutas principales en `app/`:

- `(public)`: landing, login, registro.
- `(dashboard)`: paneles de admin, juez y participante.

## Requisitos

- Node.js 22+
- pnpm 10+

## Setup local

1. Instala dependencias:

```bash
pnpm install
```

2. Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

3. Abre `http://localhost:3000`.

## Scripts utiles

- `pnpm dev`: desarrollo.
- `pnpm build`: build de produccion.
- `pnpm start`: servidor de produccion.
- `pnpm lint`: lint global.
- `pnpm test`: suite completa de tests (Vitest).
- `pnpm test:admin`: tests de admin.
- `pnpm test:judge`: tests de juez.
- `pnpm test:participant`: tests de participante.

## OpenAPI y sincronizacion con backend

Para regenerar tipos desde el backend:

```bash
pnpm openapi:sync
```

Este script:

1. Regenera el spec OpenAPI en el backend.
2. Actualiza los tipos generados en frontend.

## Notas

- El archivo `src/core/config.ts` concentra configuracion global de app.
- La UI sigue los disenos ubicados en la carpeta `Pencil.dev` del workspace.
