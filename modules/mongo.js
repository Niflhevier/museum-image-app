const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config({ path: "../.env/mongo.env" });

const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

mongoClient
  .connect()
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error: ", err);
    process.exit(1);
  });

const db = mongoClient.db("images");
const collection = db.collection("metadata");

module.exports = { collection };