const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../src/app');

describe('auth/session and middleware', () => {
  it('register creates a user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'AuthUser',
      email: `auth-${Date.now()}@mail.com`,
      password: 'password123',
      password1: 'password123',
    });

    expect(res.status).to.be.oneOf([200, 201]);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email');
  });

  it('login returns token and /api/auth/me returns current user with token', async () => {
    const email = `auth2-${Date.now()}@mail.com`;
    const pw = 'password123';

    const reg = await request(app).post('/api/auth/register').send({
      name: 'AuthUser2',
      email,
      password: pw,
      password1: pw,
    });

    const login = await request(app).post('/api/auth/login').send({ email, password: pw });

    expect(login.status).to.equal(200);
    expect(login.body).to.have.property('token');

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).to.equal(200);
    expect(me.body).to.have.property('email', email);
  });

  it('invalid or missing token returns 401 on protected endpoints', async () => {
    const bad = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token');
    expect(bad.status).to.equal(401);

    const none = await request(app).get('/api/auth/me');
    expect(none.status).to.equal(401);
  });

  it('unknown route returns 404', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).to.equal(404);
  });
});
