const app = require("./src/app");
const PORT = process.env.PORT || 8080;
const connectMongo = require("./src/config/db.mongo");

const start = async () => {
  try {
    await require("./src/config/db.mongo")(); // ensure DB connects before server starts
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
