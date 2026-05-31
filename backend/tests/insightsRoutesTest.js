const request = require("supertest");
const { expect } = require("chai");
const { app } = require("../src/app");

describe("insights routes", () => {
  let token;

    beforeEach(async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
        name: "Test User",
        email: `insights-${Date.now()}-${Math.random()}@mail.com`,
        password: "password123",
        password1: "password123",
        });

    console.log("REGISTER RESPONSE:", response.status, response.body);

    expect(response.status).to.be.oneOf([200, 201]);
    expect(response.body.token).to.be.a("string");

    token = response.body.token;
    });

  it("should return insights based on user entries", async () => {
    await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 2,
        mood: 4,
        sleepHours: 8,
        energy: 5,
        workload: 2,
      });

    await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 5,
        mood: 2,
        sleepHours: 4,
        energy: 1,
        workload: 5,
      });

    const response = await request(app)
      .get("/api/insights")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("today");
    expect(response.body).to.have.property("averages");
    expect(response.body).to.have.property("insights");
    expect(response.body.insights.today).to.be.an("array");
    expect(response.body.insights.trend).to.be.an("array");
  });
});