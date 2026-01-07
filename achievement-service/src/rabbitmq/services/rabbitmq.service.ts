import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  async connect(): Promise<void> {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    this.connection = amqp.connect([rabbitmqUrl]);
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: any) => {
        await channel.assertExchange('achievement.events', 'topic', { durable: true });
      },
    });
  }

  async publishEvent(exchange: string, message: any): Promise<void> {
    try {
      await this.channelWrapper.publish(
        exchange,
        message.routingKey || '',
        message.data || message,
      );
    } catch (error) {
      throw new Error(`Failed to publish event: ${error.message}`);
    }
  }

  async subscribe(exchange: string, queue: string, callback: (msg: any) => void): Promise<void> {
    // Placeholder for subscription logic
    console.log(`Subscribing to ${exchange} - ${queue}`);
  }
}
