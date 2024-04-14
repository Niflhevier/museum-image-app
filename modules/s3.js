const { S3Client, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("dotenv").config({ path: ".aws.env" });

const BucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// https://medium.com/@Games24x7Tech/a-complete-guide-to-s3-file-upload-using-pre-signed-post-urls-9cb2d6cfc0ab
const createPresignedPostUrl = async (id, hash) => {
  const Key = `imgs/${id}.png`;
  const Conditions = [
    { bucket: BucketName },
    { key: Key },
    { "Content-Md5": hash },
    ["content-length-range", 1024, 5242880],
    ["eq", "$Content-Type", "image/png"],
  ];

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: BucketName,
    Key,
    Conditions,
    Fields: { "Content-Md5": hash },
    Expires: 300,
  });

  return { url, fields, id };
};

const checkFileExists = async (idString) => {
  const Key = `imgs/${idString}.png`;
  try {
    const data = await s3Client.send(new HeadObjectCommand({ Bucket: BucketName, Key }));
    if (data.$metadata.httpStatusCode === 200) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
};

const createPresignedGetUrl = async (idString) => {
  const Key = `imgs/${idString}.png`;
  if (!(await checkFileExists(idString))) {
    return null;
  }
  return await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: BucketName, Key }));
};

module.exports = { createPresignedPostUrl, createPresignedGetUrl, checkFileExists };
