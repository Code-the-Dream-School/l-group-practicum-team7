const request = require('supertest');
const { app } = require('../src/app');
const mongoose = require('mongoose');

async function createTestUser({ name, email, password } = {}) {
  const pw = password || 'password123';
  const em = email || `test-${Date.now()}-${Math.random()}@mail.com`;

  const res = await request(app).post('/api/auth/register').send({
    name: name || 'Test User',
    email: em,
    password: pw,
    password1: pw,
  });

  return { user: res.body.user, token: res.body.token, res };
}

async function loginTestUser(email, password = 'password123') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function createEntryForUser(token, overrides = {}) {
  const body = Object.assign(
    {
      stress: 3,
      mood: 3,
      sleepHours: 7,
      energy: 3,
      workload: 3,
    },
    overrides,
  );

  const res = await request(app).post('/api/entries').set('Authorization', `Bearer ${token}`).send(body);
  return res;
}

async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  createTestUser,
  loginTestUser,
  authHeader,
  createEntryForUser,
  clearDatabase,
};
