# Infraestructura - Gaming Logros y Recompensas Backend

Configuración de infraestructura para el sistema de microservicios.

## Componentes

### PostgreSQL
- **postgres-players**: Puerto 5432 - Base de datos del Player Service
- **postgres-achievements**: Puerto 5433 - Base de datos del Achievement Service
- **postgres-rewards**: Puerto 5434 - Base de datos del Reward Service

### RabbitMQ
- **Puerto AMQP**: 5672
- **Puerto Management UI**: 15672
- **Usuario**: guest
- **Contraseña**: guest

## Scripts de Inicialización

### init-databases/
Contiene scripts SQL para inicializar cada base de datos con esquemas y datos de prueba.

### rabbitmq/
Configuración de exchanges, queues y bindings para RabbitMQ.

## Uso

```bash
# Levantar toda la infraestructura
docker-compose up -d postgres-players postgres-achievements postgres-rewards rabbitmq

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Limpiar datos (cuidado!)
docker-compose down -v
```

## Acceso a Servicios

- **RabbitMQ Management**: http://localhost:15672
- **PostgreSQL Players**: localhost:5432
- **PostgreSQL Achievements**: localhost:5433
- **PostgreSQL Rewards**: localhost:5434
