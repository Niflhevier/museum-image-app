const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { Client } = require("@elastic/elasticsearch");

require("dotenv").config({ path: ".es.env" });
require("dotenv").config({ path: ".mongo.env" });

const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

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

const uploadDocument = async (objectId, document) => {
  try {
    await collection.insertOne({ _id: objectId, ...document });
  } catch (err) {
    console.error("MongoDB Upload Error:", err.message);
    return false;
  }

  try {
    await elasticClient.index({
      index: "mongo-images-metadata",
      id: objectId.toString(),
      body: { id: objectId.toString(), ...document },
    });
  } catch (err) {
    console.error("Elasticsearch Upload Error:", err.message);
    try {
      await collection.deleteOne({ _id: objectId });
    } catch (err) {
      console.error("MongoDB Deletion Error:", err.message);
    }
    return false;
  }

  return true;
};

const deleteByObjectId = async (objectId) => {
  console.log("Deleting", objectId, "from MongoDB and Elasticsearch.");
  try {
    await collection.deleteOne({ _id: objectId });
  } catch (err) {
    console.error("MongoDB Deletion Error:", err.message);
  }

  try {
    await elasticClient.delete({
      index: "mongo-images-metadata",
      id: objectId.toString(),
    });
  } catch (err) {
    console.error("Elasticsearch Error:", err.message);
  }
}

module.exports = { collection, elasticClient, deleteByObjectId, uploadDocument };