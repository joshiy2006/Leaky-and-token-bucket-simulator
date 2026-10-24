// api/tests/api.test.js
const request = require('supertest');
const app = require('../server'); // assuming server.js exports the Express app

describe('Simulation API', () => {
  test('POST /api/simulate/token_bucket returns events and metrics', async () => {
    const payload = {
      arrival_rate: 5,
      burst_size: 0,
      token_rate: 2,
      bucket_capacity: 10,
      simulation_time: 5,
      queue_capacity: 0,
    };
    const response = await request(app)
      .post('/api/simulate/token_bucket')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveProperty('events');
    expect(response.body).toHaveProperty('metrics');
    expect(Array.isArray(response.body.events)).toBe(true);
  });
});
