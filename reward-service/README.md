# Reward Service

Microservicio para otorgamiento de recompensas cuando se desbloquean logros.

## Responsabilidades

- Escuchar eventos de logros desbloqueados (Patrón Observer)
- Otorgar recompensas (monedas, ítems, puntos)
- Registrar histórico de recompensas
- Consultar inventario del jugador
- Prevenir duplicación de recompensas (idempotencia)

## Estructura

```
src/
├── main.ts
├── app.module.ts
├── rewards/                   # Gestión de recompensas
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   └── rewards.module.ts
├── inventory/                 # Inventario de jugadores
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   └── inventory.module.ts
├── event-listener/            # Observer - Escucha logros
│   ├── services/
│   └── event-listener.module.ts
└── rabbitmq/                  # Publicación de eventos
    ├── services/
    └── rabbitmq.module.ts
```

## API Endpoints

- `GET /api/rewards/player/:playerId` - Historial de recompensas
- `GET /api/rewards/inventory/:playerId` - Inventario del jugador

## Eventos

### Escucha (Consumer)
- Queue: `reward.achievement_unlocked`
- Exchange: `achievement.events`
- Routing Key: `achievement.unlocked`

### Publica (Publisher)
- Exchange: `reward.events`
- Routing Keys: `reward.granted`, `reward.failed`

## Idempotencia

Este servicio garantiza que las recompensas no se dupliquen usando claves de idempotencia basadas en `playerId-achievementId`.
