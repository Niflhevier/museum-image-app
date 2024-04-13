const { S3Client, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// https://medium.com/@Games24x7Tech/a-complete-guide-to-s3-file-upload-using-pre-signed-post-urls-9cb2d6cfc0ab
const createPresignedPostUrl = async (Id, md5) => {
  const Key = `imgs/${Id}.png`;
  const Conditions = [
    { bucket: BucketName },
    { key: Key },
    { "Content-Md5": md5 },
    ["content-length-range", 1024, 5242880],
    ["eq", "$Content-Type", "image/png"],
  ];

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: BucketName,
    Key,
    Conditions,
    Fields: { "Content-Md5": md5 },
    Expires: 300,
  });

  return { url, fields, imageId: Id };
};

const createPresignedGetUrl = async (Id) => {
  const Key = `imgs/${Id}.png`;

  try {
    const data = await s3Client.send(new HeadObjectCommand({ Bucket: BucketName, Key }));
    if (data.$metadata.httpStatusCode === 200) {
      return await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: BucketName, Key }), { expiresIn: 300 });
    }
  } catch (err) {
    return null;
  }
  return null;
};

module.exports = { createPresignedPostUrl, createPresignedGetUrl };
