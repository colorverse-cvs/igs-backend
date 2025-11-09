import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class NotificationsSMSService {
  private twilioClient: Twilio.Twilio;

  constructor() {
    this.twilioClient = Twilio('ACCOUNT_SID', 'AUTH_TOKEN');

  }

  async sendOrderConfirmationSMS(phone: string, orderId: number) {
    await this.twilioClient.messages.create({
      body: `Your order with ID ${orderId} has been confirmed.`,
      from: '+1234567890',
      to: phone,
    });
  }

  async sendShippingUpdateSMS(phone: string, orderId: number, status: string) {
    await this.twilioClient.messages.create({
      body: `Your order with ID ${orderId} is now ${status}.`,
      from: '+1234567890',
      to: phone,
    });
  }
}
