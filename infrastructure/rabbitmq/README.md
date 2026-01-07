# RabbitMQ Configuration

Esta carpeta contiene scripts para configurar RabbitMQ con los exchanges, queues y bindings necesarios.

## Configuración Automática

El script `init-rabbitmq.sh` se ejecuta automáticamente cuando se levanta el contenedor de RabbitMQ por primera vez.

## Estructura de Mensajería

### Exchanges
- `player.events` (fanout) - Eventos de jugadores
- `achievement.events` (topic) - Eventos de logros
- `reward.events` (topic) - Eventos de recompensas

### Queues
- `achievement.player_actions` - Consume eventos de jugadores
- `reward.achievement_unlocked` - Consume logros desbloqueados

### Bindings
- `player.events` → `achievement.player_actions`
- `achievement.events` (achievement.unlocked) → `reward.achievement_unlocked`

## Configuración Manual

Si necesitas configurar manualmente:

```bash
# Acceder al contenedor
docker exec -it rabbitmq bash

# Ejecutar comandos rabbitmqadmin
rabbitmqadmin declare exchange name=player.events type=fanout durable=true
rabbitmqadmin declare queue name=achievement.player_actions durable=true
rabbitmqadmin declare binding source=player.events destination=achievement.player_actions
```
