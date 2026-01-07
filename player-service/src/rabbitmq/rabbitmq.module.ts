// RabbitMQ Module - Configuración y publicación de eventos
import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './services/rabbitmq.service';

@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
