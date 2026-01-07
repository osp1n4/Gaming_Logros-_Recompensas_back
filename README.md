# Gaming Logros y Recompensas - Backend

Sistema backend orientado a eventos basado en arquitectura de microservicios modulares.

## Microservicios

### Player Service (Puerto 3001)
Gestiona jugadores y recibe eventos del juego.

### Achievement Service (Puerto 3002)
Evalúa y desbloquea logros basados en eventos del jugador.

### Reward Service (Puerto 3003)
Otorga recompensas cuando se desbloquean logros.

## Stack Tecnológico

- **Lenguaje**: TypeScript
- **Runtime**: Node.js 20.x
- **Framework**: NestJS
- **Base de Datos**: PostgreSQL
- **Message Broker**: RabbitMQ
- **Contenedores**: Docker
- **Orquestación**: Docker Compose

## Estructura del Proyecto

```
Gaming_Logros_Recompensas_back/
├── player-service/          # Microservicio de jugadores
├── achievement-service/     # Microservicio de logros
├── reward-service/          # Microservicio de recompensas
├── infrastructure/          # Configuración de infraestructura
├── docker-compose.yml       # Orquestación de contenedores
└── README.md                # Documentación
```

## Comandos Rápidos

### Desarrollo Local
```bash
# Instalar dependencias en todos los servicios
npm run install:all

# Levantar infraestructura (PostgreSQL + RabbitMQ)
docker-compose up -d postgres-players postgres-achievements postgres-rewards rabbitmq

# Ejecutar servicios en desarrollo
npm run dev:player
npm run dev:achievement
npm run dev:reward
```

### Docker
```bash
# Construir todas las imágenes
docker-compose build

# Levantar todo el sistema
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down
```

## URLs de Desarrollo

- **Player Service**: http://localhost:3001
- **Achievement Service**: http://localhost:3002
- **Reward Service**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672 (user: guest, pass: guest)

## Documentación Completa

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos de la arquitectura.
