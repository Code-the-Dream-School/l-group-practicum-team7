const request = require("supertest");
const { expect } = require("chai");
const { app } = require("../src/app");

describe("entries routes", () => {
  it("should reject creating entry without token", async () => {
    const response = await request(app)
      .post("/api/entries")
      .send({
        stress: 3,
        mood: 3,
        sleepHours: 7,
        energy: 3,
        workload: 3,
      });

    expect(response.status).to.equal(401);
  });
});

describe("entries routes with auth", () => {
  let token;

  beforeEach(async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test-${Date.now()}-${Math.random()}@mail.com`,
        password: "password123",
        password1: "password123",
      });

    console.log("REGISTER RESPONSE:", response.status, response.body);

    expect(response.status).to.be.oneOf([200, 201]);
    expect(response.body.token).to.be.a("string");

    token = response.body.token;
  });

  it("should create entry with valid token", async () => {
    const response = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 5,
        mood: 2,
        sleepHours: 4,
        energy: 1,
        workload: 5,
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("stress", 5);
    expect(response.body).to.have.property("energy", 1);
    expect(response.body).to.have.property("burnoutScore");
    expect(response.body).to.have.property("burnoutLevel");
  });

  it("should reject invalid stress value", async () => {
    const response = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 10,
        mood: 3,
        sleepHours: 7,
        energy: 3,
        workload: 3,
      });

    expect(response.status).to.equal(400);
  });
});