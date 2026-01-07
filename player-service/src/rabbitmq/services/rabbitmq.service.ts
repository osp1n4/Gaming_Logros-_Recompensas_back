// RabbitMQ Service - Servicio para publicar eventos a RabbitMQ
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    
    this.connection = amqp.connect([rabbitMQUrl]);
    
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        const exchange = process.env.RABBITMQ_EXCHANGE || 'player.events';
        const exchangeType = process.env.RABBITMQ_EXCHANGE_TYPE || 'fanout';
        await channel.assertExchange(exchange, exchangeType, { durable: true });
      },
    });
  }

  async publishEvent(exchange: string, message: any): Promise<void> {
    try {
      await this.channelWrapper.publish(exchange, '', message);
    } catch (error) {
      throw new Error(`Failed to publish event: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.channelWrapper) {
      await this.channelWrapper.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
