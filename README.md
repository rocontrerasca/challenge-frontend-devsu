# Challenge Frontend Devsu (Angular 20)

Proyecto Angular standalone con:
- Routing con `provideRouter`
- `provideHttpClient`
- Builder clásico (`@angular-devkit/build-angular`)
- Formulario reactivo para crear cuentas (Accounts)
- Servicios y modelos básicos
- Estructura TS/HTML/SCSS separada
- Environments (`environment.ts` / `environment.development.ts`)
- Jest configurado (mínimo)

## Requisitos
- Node 20.x
- Angular CLI 20.x

## Ejecutar
```bash
npm i
ng serve --proxy-config proxy.conf.json
```

## Build
```bash
ng build
```


## Endpoints esperados (ajusta si tu backend difiere)
- GET  /api/client
- POST /api/client
- PUT  /api/client/{id}
- DELETE /api/client/{id}

- GET  /api/account/client/{clientId}
- POST /api/account
- PUT  /api/account/{id}
- DELETE /api/account/{id}

- POST  /api/move
- GET   /api/move
- POST  /api/move/report

Cambia `src/environments/*` y `proxy.conf.json` si tu API no usa `/api` o está en otro host/puerto.
