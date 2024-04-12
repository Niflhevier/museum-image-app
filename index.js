const express = require("express");
const db = require("mongoose");
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const app = express();
const path = require("path");

db.connect(
  "mongodb+srv://foah:KsuBUW5SDnrAWtIb@foah.dcq2ec2.mongodb.net/images?retryWrites=true&w=majority&appName=foah"
)
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error: ", err);
  });

db.connection.on("disconnected", (err) => {
  console.error("MongoDB Connection Broken: ", err);
  process.exit(1);
});

const ImageSchema = new db.Schema({
  description: String,
  dimensions: [Number, Number],
});

const ImageModel = db.model("metadata", ImageSchema);

const s3Client = new S3Client({
  region: "ap-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(express.static(path.resolve(__dirname, "./app/build")));

// https://medium.com/@Games24x7Tech/a-complete-guide-to-s3-file-upload-using-pre-signed-post-urls-9cb2d6cfc0ab
app.post("/api/upload", express.json(), async (req, res) => {
  const { md5, description, dimensions } = req.body;
  const Bucket = "foah-awsbucket";
  const Id = new db.Types.ObjectId();
  const Key = `imgs/${Id}.png`;
  const Fields = { "Content-Md5": md5 };
  const Conditions = [
    { bucket: Bucket },
    { key: Key },
    { "Content-Md5": md5 },
    ["content-length-range", 512, 5242880],
    ["eq", "$Content-Type", "image/png"],
  ];
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket,
    Key,
    Conditions,
    Fields,
    Expires: 300,
  });

  const record = new ImageModel({ _id: Id, description, dimensions: [dimensions.width, dimensions.height] });
  await record
    .save()
    .then(() => {
      res.json({ url, fields, imageId: Id.toString() });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ error: err });
    });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./app/build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`);
});
