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
      await this.channelWrapper.publish(exchange, '', message, {
        persistent: true,
      });
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
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.connection = await amqp.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async publishEvent(exchange: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ connection failed');
    }

    await this.channel.assertExchange(exchange, 'fanout', { durable: true });
    this.channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
  }
}
