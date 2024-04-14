const { createPresignedPostUrl, createPresignedGetUrl, checkFileExists } = require("./modules/s3");
const { collection, elasticClient, deleteByObjectId, uploadDocument } = require("./modules/db");
const express = require("express");
const createError = require("http-errors");
const { ObjectId } = require("mongodb");
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

  if (!(await uploadDocument(objectId, metadata))) {
    return res.status(400).json({ error: "MongoDB Insert Error!" });
  }

  res.json(await createPresignedPostUrl(objectId.toString(), hash));
});

app.get("/api/v1/img/:id", async (req, res) => {
  const objectId = new ObjectId(req.params.id);

  const query = await collection.findOne({ _id: objectId });
  if (!query) {
    return res.status(404).json({ error: "Image not found!" })
  };

  const url = await createPresignedGetUrl(objectId.toString());
  if (!url) {
    await deleteByObjectId(objectId);
    return res.status(404).json({ error: "Image not found!" });
  }
  res.json({ url, ...query });
});

app.post("/api/v1/search", express.json(), async (req, res) => {
  const { description } = req.body;

  if (typeof description !== "string") {
    return res.status(400).json({ error: "Invalid request body!" });
  }

  // special case for description with empty string, ref: https://stackoverflow.com/a/59020777
  const emptyQuery = {
    bool: { must: { exists: { field: "description" } }, must_not: [{ wildcard: { description: "*" } }] },
  };
  const normalQuery = {
    bool: { should: [{ match: { description: description } }, { fuzzy: { description: { value: description, fuzziness: "AUTO" } } },], },
  };

  const result = await elasticClient.search({
    index: "mongo-images-metadata",
    query: description ? normalQuery : emptyQuery,
  });

  // check if the file exists in S3 from the search result
  const hits = await Promise.all(result.hits.hits.map(async (hit) => {
    const exists = await checkFileExists(hit._source.id);
    if (!exists) await deleteById(hit._source.id);
    return exists ? hit._source : null;
  })).then(results => results.filter(hit => hit));

  res.json({ result: hits });
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
