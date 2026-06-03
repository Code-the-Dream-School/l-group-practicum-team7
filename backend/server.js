require("dotenv").config();

const { app, connectDB } = require("./src/app");

const PORT = process.env.PORT || 8080;

const start = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB or start server");
    console.error(error.message);
    process.exit(1);
  }
};

start();