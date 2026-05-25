const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(20000);

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  },

  async afterAll() {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  },

  async afterEach() {
    const collections = mongoose.connection.collections;

    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  },
};