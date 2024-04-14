const { createPresignedPostUrl, createPresignedGetUrl } = require("./modules/s3");
const { collection } = require("./modules/mongo");
const elasticClient = require("./modules/es");
const { ObjectId } = require("mongodb");

const express = require("express");
const createError = require("http-errors");

const app = express();
const path = require("path");

app.use(express.static(path.resolve(__dirname, "./frontend/build")));

app.post("/api/v1/upload", express.json(), async (req, res) => {
  const { hash, description, dimensions } = req.body;

  if (
    typeof hash !== "string" ||
    typeof description !== "string" ||
    !dimensions ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return res.status(400).json({ error: "Invalid request body!" });
  }

  const objectId = new ObjectId();
  const metadata = { description, dimensions: [dimensions.width, dimensions.height] };

  try {
    await collection.insertOne({ _id: objectId, ...metadata });
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    return res.status(400).json({ error: "MongoDB Insert Error!" });
  }

  try {
    await elasticClient.index({
      index: "mongo-images-metadata",
      id: objectId.toString(),
      body: { id: objectId.toString(), ...metadata },
    });
  } catch (err) {
    console.error("Elasticsearch Error:", err.message);
    try {
      await collection.deleteOne({ _id: objectId });
    } catch (err) {
      console.error("MongoDB Deletion Error:", err.message);
    }
    return res.status(400).json({ error: "Elasticsearch Index Error!" });
  }

  res.json(await createPresignedPostUrl(objectId.toString(), hash));
});

app.get("/api/v1/img/:id", async (req, res) => {
  const Id = new ObjectId(req.params.id);
  const query = await collection.findOne({ _id: Id });
  if (!query) return res.status(404).json({ error: "Image not found!" });

  const url = await createPresignedGetUrl(Id);
  if (!url) {
    try {
      await collection.deleteOne({ _id: Id });
    } catch (err) {
      console.error("MongoDB Deletion Error:", err.message);
    }

    try {
      await elasticClient.delete({ index: "mongo-images-metadata", id: Id.toString() });
    } catch (err) {
      console.error("Elasticsearch Deletion Error:", err.message);
    }

    throw new Error("Failed to generate presigned URL!");
  }

  res.json({ url, ...query });
});

app.post("/api/v1/search", express.json(), async (req, res) => {
  const { description } = req.body;

  if (typeof description !== "string") {
    return res.status(400).json({ error: "Invalid request body!" });
  }

  // special case for description with empty string
  // https://stackoverflow.com/a/59020777
  const query =
    description === ""
      ? {
        bool: {
          must: { exists: { field: "description" } },
          must_not: [{ wildcard: { description: "*" } }],
        },
      }
      : {
        bool: {
          should: [
            { match: { description: description } },
            { fuzzy: { description: { value: description, fuzziness: "AUTO" } } },
          ],
        },
      };

  const result = await elasticClient.search({
    index: "mongo-images-metadata",
    query: query,
  });

  res.json({ result: result.hits.hits.map((hit) => hit._source) });
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`);
});
