const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../src/app');

describe('error handling', () => {
  it('BadRequestError via register returns 400 and msg', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'x'
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('msg');
    expect(res.body.msg).to.match(/Name, email/);
  });

  it('NotFoundError (unknown route) returns 404 and msg', async () => {
    const res = await request(app).get('/no-such-route-foobar');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('msg');
    expect(res.body.msg).to.equal('Route does not exist');
  });

  it('unexpected errors return 500 and msg', async () => {
    const express = require('express');
    const router = express.Router();
    router.get('/__test_throw', () => {
      throw new Error('boom');
    });
    app.use(router);
    const layer = app._router.stack.pop();
    app._router.stack.splice(0, 0, layer);

    const res = await request(app).get('/__test_throw');
    expect(res.status).to.equal(500);
  });
});
