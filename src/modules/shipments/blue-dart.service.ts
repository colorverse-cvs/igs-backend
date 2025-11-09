import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlueDartService {
  private readonly logger = new Logger(BlueDartService.name);
  private baseUrl: string;
  private apiKey: string;
  private username: string;
  private password: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('BLUEDART_BASE_URL') || '';
    this.apiKey = this.config.get<string>('BLUEDART_API_KEY') || '';
    this.username = this.config.get<string>('BLUEDART_USERNAME') || '';
    this.password = this.config.get<string>('BLUEDART_PASSWORD') || '';
  }

  async createShipment(payload: any): Promise<{ trackingId: string; estimatedDelivery?: string; raw: any }> {
    try {
      // Map payload to BlueDart API shape according to their docs.
      const url = `${this.baseUrl}/createShipment`; // replace with actual endpoint
      const resp = await axios.post(url, payload, {
        headers: { 'X-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
        auth: { username: this.username, password: this.password },
        timeout: 10000,
      });
      const data = resp.data;
      const trackingId = data?.awbNo || data?.trackingNumber || data?.trackingId;
      return { trackingId, estimatedDelivery: data?.eta, raw: data };
    } catch (err) {
      this.logger.error('BlueDart createShipment error', err?.response?.data || err.message);
      throw err;
    }
  }

  async track(trackingId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/track/${encodeURIComponent(trackingId)}`; // replace with actual endpoint
      const resp = await axios.get(url, {
        headers: { 'X-API-KEY': this.apiKey },
        auth: { username: this.username, password: this.password },
        timeout: 8000,
      });
      return resp.data;
    } catch (err) {
      this.logger.error('BlueDart track error', err?.response?.data || err.message);
      throw err;
    }
  }
}