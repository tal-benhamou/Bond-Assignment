import { Injectable } from '@nestjs/common';
import { HealthResponse } from '../responses/health.response';

@Injectable()
export class HealthService {
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
