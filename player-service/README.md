# Player Service

Microservicio para gestión de jugadores y eventos del juego.

## Responsabilidades

- Gestionar CRUD de jugadores
- Recibir eventos del juego
- Validar eventos entrantes (Patrón Proxy)
- Publicar eventos normalizados a RabbitMQ

## Estructura

```
src/
├── main.ts                    # Punto de entrada
├── app.module.ts              # Módulo raíz
├── players/                   # Módulo de jugadores
│   ├── controllers/           # Endpoints REST
│   ├── services/              # Lógica de negocio
│   ├── repositories/          # Acceso a datos
│   ├── entities/              # Entidades TypeORM
│   ├── dto/                   # Data Transfer Objects
│   └── players.module.ts
├── events/                    # Módulo de eventos del juego
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── dto/
│   └── events.module.ts
├── rabbitmq/                  # Módulo de mensajería
│   ├── services/
│   └── rabbitmq.module.ts
└── config/                    # Configuraciones
```

## API Endpoints

- `POST /api/players` - Crear jugador
- `GET /api/players/:id` - Obtener jugador
- `PUT /api/players/:id` - Actualizar jugador
- `GET /api/players/:id/stats` - Estadísticas del jugador
- `POST /api/players/:id/events` - Recibir evento del juego

## Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm run test
```

## Docker

```bash
# Build
docker build -t player-service .

# Run
docker run -p 3001:3001 player-service
```
