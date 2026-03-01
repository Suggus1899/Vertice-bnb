import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from './index';

// Mocking socket service since it starts a real server or depends on one
vi.mock('./services/socket.service', () => ({
  initializeSocket: vi.fn(() => ({
    io: {
      engine: {
        clientsCount: 0
      }
    }
  }))
}));

describe('API Health Check', () => {
  it('should return 200 OK for /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should return 200 OK for /api', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Vetice API');
  });
});
