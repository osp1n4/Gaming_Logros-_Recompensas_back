#!/bin/bash
# RabbitMQ Configuration Script
# Crea exchanges, queues y bindings necesarios

# Wait for RabbitMQ to be ready
sleep 10

# Create exchanges
rabbitmqadmin declare exchange name=player.events type=fanout durable=true
rabbitmqadmin declare exchange name=achievement.events type=topic durable=true
rabbitmqadmin declare exchange name=reward.events type=topic durable=true

# Create queues
rabbitmqadmin declare queue name=achievement.player_actions durable=true
rabbitmqadmin declare queue name=reward.achievement_unlocked durable=true

# Create bindings
rabbitmqadmin declare binding source=player.events destination=achievement.player_actions
rabbitmqadmin declare binding source=achievement.events destination=reward.achievement_unlocked routing_key=achievement.unlocked

echo "RabbitMQ configuration completed successfully!"
