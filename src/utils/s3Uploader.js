const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } =
  process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const getCurrentMonthName = () => {
  return new Date().toLocaleString("en-US", { month: "long" });
};

const uploadFileToS3 = async (file) => {
  const monthFolder = getCurrentMonthName();
  const fileName = `${Date.now()}_${file.originalname}`;
  const key = monthFolder ? `${monthFolder}/${fileName}` : fileName;

  const uploadParams = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const upload = new Upload({
    client: s3,
    params: uploadParams,
  });

  await upload.done();

  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = { uploadFileToS3 };
