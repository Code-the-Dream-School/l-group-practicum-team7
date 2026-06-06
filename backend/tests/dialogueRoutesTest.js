const request = require("supertest");
const { expect } = require("chai");
const { app } = require("../src/app");

describe("dialogue routes", () => {
  it("should return 401 for available dialogues when unauthenticated", async () => {
    const res = await request(app).get("/api/dialogues/available");
    expect(res.status).to.equal(401);
  });

  it("no entries returns default low-energy dialogue branch for user", async () => {
    const register = await request(app).post("/api/auth/register").send({
      name: "DLUser",
      email: `dl-${Date.now()}@mail.com`,
      password: "password123",
      password1: "password123",
    });

    const token = register.body.token;

    const res = await request(app)
      .get("/api/dialogues/available")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("problems");
    expect(res.body.problems).to.be.an("array");
    expect(res.body.problems[0].problemKey).to.equal("low_energy");
  });

  it("high stress unlocks workload-related dialogue and unlocking tools is user-specific", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      name: "DLUser2",
      email: `dl2-${Date.now()}@mail.com`,
      password: "password123",
      password1: "password123",
    });

    const token = reg.body.token;

    await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        stress: 5,
        mood: 2,
        sleepHours: 5,
        energy: 2,
        workload: 5,
      });

    const avail = await request(app)
      .get("/api/dialogues/available")
      .set("Authorization", `Bearer ${token}`);

    expect(avail.status).to.equal(200);
    const keys = avail.body.dialogues.map((d) => d.problemKey);
    expect(keys).to.include("high_workload");

    const unlock = await request(app)
      .post("/api/dialogues/tools/unlock")
      .set("Authorization", `Bearer ${token}`)
      .send({ key: "tool-1", title: "Test Tool", sourceDialogue: "highWorkload" });

    expect(unlock.status).to.equal(201);
    expect(unlock.body).to.have.property("tool");
    expect(unlock.body.tool).to.have.property("key", "tool-1");

    const toolsRes = await request(app)
      .get("/api/dialogues/tools")
      .set("Authorization", `Bearer ${token}`);

    expect(toolsRes.status).to.equal(200);
    expect(toolsRes.body.tools.some((t) => t.key === "tool-1")).to.be.true;

    const reg2 = await request(app).post("/api/auth/register").send({
      name: "DLUser3",
      email: `dl3-${Date.now()}@mail.com`,
      password: "password123",
      password1: "password123",
    });

    const otherTools = await request(app)
      .get("/api/dialogues/tools")
      .set("Authorization", `Bearer ${reg2.body.token}`);

    expect(otherTools.status).to.equal(200);
    expect(otherTools.body.tools).to.be.an("array");
    expect(otherTools.body.tools.length).to.equal(0);

    const reset = await request(app)
      .delete("/api/dialogues/tools")
      .set("Authorization", `Bearer ${token}`);

    expect(reset.status).to.equal(200);
    expect(reset.body.tools).to.be.an("array");
    expect(reset.body.tools.length).to.equal(0);
  });
});
