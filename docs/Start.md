You are a senior frontend architect.

Create a production-ready Next.js 16 project using App Router with a clean, scalable architecture.

This project is called "NOMBRE".
It is frontend-only for now (NO backend, NO database).
All data must come from a mock layer.
The goal is pixel-perfect UI replication from Figma, with clean architecture and long-term maintainability.

---

## TECH STACK REQUIREMENTS

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode enabled)
- Tailwind CSS
- shadcn/ui (only as base components)
- Zustand (state management)
- React Hook Form
- Zod (validation)
- Lucide React (icons)
- Framer Motion (animation-ready)
- ESLint + Prettier configured

---

## ARCHITECTURE STYLE

Use a hybrid architecture:

- Feature-based structure
- Clean Architecture adapted to frontend
- Domain separation
- Service pattern
- Mock infrastructure layer

NO logic inside UI components.
NO mock data inside components.
NO direct state mutations.

---

## PROJECT STRUCTURE

Create this folder structure:

/app
/(public)
page.tsx
login/page.tsx
register/page.tsx
/(dashboard)
layout.tsx
participante/page.tsx
juez/page.tsx
admin/page.tsx

/src
/core
config.ts
constants.ts
types.ts

/domain
/user
user.types.ts
user.model.ts
/event
event.types.ts
event.model.ts

/application
/auth
auth.service.ts
/events
events.service.ts

/infrastructure
/mock
mock-users.ts
mock-events.ts

/presentation
/components
/ui
/layout
/features
/hooks
/stores

/styles
tokens.css

---

## DOMAIN LAYER

Define types for:

User:

- id
- name
- email
- roles (PARTICIPANTE | JUEZ | ADMIN | SUPERADMIN)
- verified

Event:

- id
- name
- category
- status
- countdown

---

## APPLICATION LAYER

Create services:

auth.service.ts

- login(email, password)
- logout()
- switchRole(role)
- getCurrentUser()

events.service.ts

- getEvents()
- getEventById()

These services must use mock data from infrastructure layer.

---

## INFRASTRUCTURE LAYER

Create mock data:

mock-users.ts
mock-events.ts

All fake data must live here.

---

## STATE MANAGEMENT

Create Zustand stores:

auth.store.ts

- user
- currentRole
- login()
- logout()
- switchRole()

---

## PRESENTATION RULES

- Components must be small and reusable.
- No business logic inside UI.
- Use custom hooks when necessary.
- Use Tailwind with design tokens.
- Prepare layout components:
  Sidebar
  Header
  DashboardLayout

---

## DESIGN SYSTEM

Create tokens.css with CSS variables for:

- colors
- radius
- spacing
- typography

Integrate tokens with Tailwind config.

---

## CLEAN CODE RULES

- Strict typing
- No any
- No console logs
- Clear naming
- Single responsibility components
- Max 150 lines per component
- No duplicated logic

---

## FUTURE BACKEND PREPARATION

Design architecture so that replacing:

/infrastructure/mock

with

/infrastructure/api

requires minimal refactor.

---

---

## DESIGN SOURCE OF TRUTH

All UI must strictly follow the existing design files.

There is a folder:

/Pencil.dev

This folder contains official UI designs in .pen format.

Ask me FIRST when you are going to start a UI design.

These files are the single source of truth for layout, spacing, typography, colors, and component structure.

Rules:

- Do NOT redesign.
- Do NOT reinterpret layouts.
- Do NOT introduce new visual patterns.
- Always replicate structure based on Pencil.dev designs.
- If something is unclear, ask before implementing.
- Follow pixel proportions and layout hierarchy from the design files.

Any UI implementation must match the existing designs exactly.

Now generate the full base project structure with initial code skeletons.
Do not generate placeholder comments only.
Generate real code scaffolding ready to run.

Keep it clean, professional, and scalable.
