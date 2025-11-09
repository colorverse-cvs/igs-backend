import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const requestsMap = new Map<string, { count: number; timestamp: number }>();
const WINDOW_SIZE_IN_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip;
    const now = Date.now();

    const record = requestsMap.get(ip) || { count: 0, timestamp: now };
    if (now - record.timestamp > WINDOW_SIZE_IN_MS) {
      record.count = 1;
      record.timestamp = now;
    } else {
      record.count += 1;
    }

    requestsMap.set(ip, record);

    if (record.count > MAX_REQUESTS) {
      //throw new TooManyRequestsException('Too many requests. Please try again later.');
    }

    next();
  }
}
