# HMIS Angular Frontend

## Prerequisites

- Node.js 20+
- npm 10+

## Develop

```bash
npm install
npm start
```

App runs at http://localhost:4200. The dev server (and production nginx) both proxy `/api/*` to the API Gateway.

## Build

```bash
npm run build
```

Artifacts are written to `dist/hmis/browser`.

## Docker

```bash
docker build -t hmis/angular-app .
docker run -p 4200:80 hmis/angular-app
```

## Structure

- `src/app/auth/`        — login screen
- `src/app/dashboard/`   — KPIs dashboard
- `src/app/patient/`     — patient list + registration
- `src/app/appointment/` — appointment booking
- `src/app/billing/`     — invoice creation
- `src/app/core/`        — auth service, HTTP interceptor, auth guard

Roles and additional modules (clinical, lab, pharmacy, reporting) follow the same pattern and are added as separate lazy-loaded components.
