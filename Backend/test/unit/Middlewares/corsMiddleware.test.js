import { jest } from '@jest/globals';
import { corsMiddleware } from '../../../src/Middlewares/corsMiddleware.js';
import express from 'express';
import request from 'supertest';

describe('corsMiddleware', () => {
  it('should return a cors middleware function', () => {
    const mw = corsMiddleware({ acceptedOrigins: 'http://localhost' });
    expect(typeof mw).toBe('function');
  });

  it('should allow accepted origin', async () => {
    const app = express();
    app.use(corsMiddleware({ acceptedOrigins: 'http://localhost' }));
    app.get('/test', (req, res) => res.json({ ok: true }));
    await request(app)
      .get('/test')
      .set('Origin', 'http://localhost')
      .expect('Access-Control-Allow-Origin', 'http://localhost')
      .expect(200);
  });

  it('should block unaccepted origin', async () => {
    const app = express();
    app.use(corsMiddleware({ acceptedOrigins: 'http://localhost' }));
    app.get('/test', (req, res) => res.json({ ok: true }));
    await request(app)
      .get('/test')
      .set('Origin', 'http://evil.com')
      .expect(500); // CORS error triggers 500 by default
  });
});
