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

  it("created entry contains date and createdAt", async () => {
    const response = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 4,
        mood: 3,
        sleepHours: 6,
        energy: 3,
        workload: 4,
        date: new Date().toISOString(),
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("date");
    expect(response.body).to.have.property("createdAt");
  });

  it("user sees only their own entries and order is newest-first", async () => {
    const older = new Date();
    older.setDate(older.getDate() - 2);

    const respA = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 2,
        mood: 3,
        sleepHours: 7,
        energy: 4,
        workload: 2,
        date: older.toISOString(),
      });

    expect(respA.status).to.equal(201);

    const newer = new Date();
    const respB = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 5,
        mood: 2,
        sleepHours: 4,
        energy: 2,
        workload: 5,
        date: newer.toISOString(),
      });

    expect(respB.status).to.equal(201);

    const other = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Other",
        email: `other-${Date.now()}@mail.com`,
        password: "password123",
        password1: "password123",
      });

    const otherToken = other.body.token;

    const otherEntry = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        stress: 1,
        mood: 5,
        sleepHours: 8,
        energy: 5,
        workload: 1,
      });

    expect(otherEntry.status).to.equal(201);

    const list = await request(app)
      .get("/api/entries")
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).to.equal(200);
    expect(list.body).to.be.an("array");

    const otherIds = list.body.map((e) => e.userId);
    expect(otherIds.every((id) => id === list.body[0].userId)).to.be.true;

    expect(new Date(list.body[0].date)).to.be.greaterThan(new Date(list.body[1].date));
  });

  it("deleting an entry works and deleting another user's entry fails", async () => {
    const create = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 3,
        mood: 3,
        sleepHours: 6,
        energy: 3,
        workload: 3,
      });

    expect(create.status).to.equal(201);

    const id = create.body._id;

    const del = await request(app)
      .delete(`/api/entries/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(del.status).to.equal(200);

    const other = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Other2",
        email: `other2-${Date.now()}@mail.com`,
        password: "password123",
        password1: "password123",
      });

    const otherToken = other.body.token;

    const otherEntry = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        stress: 4,
        mood: 2,
        sleepHours: 5,
        energy: 2,
        workload: 4,
      });

    expect(otherEntry.status).to.equal(201);

    const forbiddenDel = await request(app)
      .delete(`/api/entries/${otherEntry.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(forbiddenDel.status).to.equal(404);
  });
});