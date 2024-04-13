const { createPresignedPostUrl, createPresignedGetUrl } = require("./modules/s3");
const { collection } = require("./modules/mongo");
const elasticClient = require("./modules/elastic-client");
const { ObjectId } = require("mongodb");

const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.resolve(__dirname, "./frontend/build")));

app.post("/api/img/upload", express.json(), async (req, res) => {
  const { md5, description, dimensions } = req.body;
  const Id = new ObjectId();

  if (
    typeof md5 !== "string" ||
    typeof description !== "string" ||
    typeof dimensions !== "object" ||
    typeof dimensions.width !== "number" ||
    typeof dimensions.height !== "number" ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return res.status(400).json({ error: "Invalid request body!" });
  }

  try {
    await collection.insertOne({
      _id: Id,
      description,
      dimensions: [dimensions.width, dimensions.height],
    });
    res.json(await createPresignedPostUrl(Id.toString(), md5));
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).json({ error: "DB Insert Error!" });
  }
});

app.get("/api/img/:id", async (req, res) => {
  try {
    const Id = new ObjectId(req.params.id);

    const query = await collection.findOne({ _id: Id });
    if (!query) {
      throw new Error("Image not found!");
    }
    const url = await createPresignedGetUrl(Id);
    if (!url) {
      await collection.deleteOne({ _id: Id });
      throw new Error("Failed to generate presigned URL!");
    }

    res.json({ url, ...query });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(404).json({ error: "Image not found!" });
  }
});

app.post("/api/img/search", express.json(), async (req, res) => {
  
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend/build", "index.html"));
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`);
});
