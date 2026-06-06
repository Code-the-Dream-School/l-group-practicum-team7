const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../src/app');
const Subscription = require('../src/models/Subscription');

describe('subscription routes', () => {
  it('unauthenticated subscription requests return 401', async () => {
    const res = await request(app).post('/api/subscription/demo-checkout').send({});
    expect(res.status).to.equal(401);
  });

  it('demo checkout success activates premium and creates subscription', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'SubUser',
      email: `sub-${Date.now()}@mail.com`,
      password: 'password123',
      password1: 'password123',
    });

    const token = reg.body.token;

    const res = await request(app)
      .post('/api/subscription/demo-checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ payment: { last4: '4242', brand: 'visa' }, demoResult: 'success' });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('premium', true);
    expect(res.body).to.have.property('status', 'active');
    expect(res.body).to.have.property('orderId');

    const sub = await Subscription.findOne({ userId: reg.body.user.id });
    expect(sub).to.exist;
    expect(sub.status).to.equal('active');
  });

  it('demo checkout fail does not activate premium', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'SubUser2',
      email: `sub2-${Date.now()}@mail.com`,
      password: 'password123',
      password1: 'password123',
    });

    const token = reg.body.token;

    const res = await request(app)
      .post('/api/subscription/demo-checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ payment: { last4: '0002', brand: 'visa' }, demoResult: 'fail' });

    expect(res.status).to.equal(402);
    expect(res.body).to.have.property('premium', false);

    const me = await request(app).get('/api/subscription/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).to.equal(200);
    expect(me.body.premium).to.be.false;
  });

  it('/api/subscription/me and demo-reset behavior and isolation', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'SubUser3',
      email: `sub3-${Date.now()}@mail.com`,
      password: 'password123',
      password1: 'password123',
    });

    const token = reg.body.token;

    await request(app)
      .post('/api/subscription/demo-checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ payment: { last4: '4242' }, demoResult: 'success' });

    const me1 = await request(app).get('/api/subscription/me').set('Authorization', `Bearer ${token}`);
    expect(me1.status).to.equal(200);
    expect(me1.body.premium).to.be.true;

    const reset = await request(app).post('/api/subscription/demo-reset').set('Authorization', `Bearer ${token}`);
    expect(reset.status).to.equal(200);
    expect(reset.body.premium).to.be.false;

    const me2 = await request(app).get('/api/subscription/me').set('Authorization', `Bearer ${token}`);
    expect(me2.status).to.equal(200);
    expect(me2.body.premium).to.be.false;

    const other = await request(app).post('/api/auth/register').send({
      name: 'SubOther',
      email: `subother-${Date.now()}@mail.com`,
      password: 'password123',
      password1: 'password123',
    });

    const otherMe = await request(app).get('/api/subscription/me').set('Authorization', `Bearer ${other.body.token}`);
    expect(otherMe.status).to.equal(200);
    expect(otherMe.body.premium).to.be.false;
  });
});
