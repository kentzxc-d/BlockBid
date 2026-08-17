const request = require('supertest');

jest.mock('@ai-sdk/google', () => ({ google: jest.fn() }));
jest.mock('ai', () => ({ generateObject: jest.fn(), generateText: jest.fn() }));

const app = require('../server');

describe('Authentication Middleware', () => {
  it('should return 401 if no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/ai/enhance')
      .send({ text: 'test', type: 'bid' });
      
    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .post('/api/ai/enhance')
      .set('Authorization', 'Bearer invalid-token')
      .send({ text: 'test', type: 'bid' });
      
    expect(res.statusCode).toEqual(401);
  });
});
