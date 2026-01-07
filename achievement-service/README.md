# Achievement Service

Microservicio para evaluación y desbloqueo de logros basado en eventos.

## Responsabilidades

- Definir reglas de logros (configurables)
- Escuchar eventos del jugador (Patrón Observer)
- Evaluar progreso de logros
- Desbloquear logros cumplidos
- Publicar eventos de logros desbloqueados

## Estructura

```
src/
├── main.ts
├── app.module.ts
├── achievements/              # Definiciones de logros
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── dto/
│   └── achievements.module.ts
├── player-achievements/       # Progreso de logros por jugador
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   └── player-achievements.module.ts
├── event-listener/            # Observer - Escucha eventos RabbitMQ
│   ├── services/
│   └── event-listener.module.ts
└── rabbitmq/                  # Publicación de eventos
    ├── services/
    └── rabbitmq.module.ts
```

## API Endpoints

- `GET /api/achievements` - Listar todos los logros
- `GET /api/achievements/:id` - Detalle de logro
- `GET /api/achievements/player/:playerId` - Logros del jugador
- `POST /api/achievements` - Crear logro (admin)

## Eventos

### Escucha (Consumer)
- Queue: `achievement.player_actions`
- Exchange: `player.events`

### Publica (Publisher)
- Exchange: `achievement.events`
- Routing Keys: `achievement.unlocked`, `achievement.progress`
