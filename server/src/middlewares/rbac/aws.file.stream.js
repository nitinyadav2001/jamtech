import { Upload } from "@aws-sdk/lib-storage";
import multer from "multer";
import { PassThrough } from "node:stream";
import s3 from "../../config/awss3.js";
import { convertS3ToCloudFrontUrl } from "../../utils/convertS3ToCloudFrontUrl.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadFilesToS3 = async (files) => {
  const uploadedFiles = [];
  // console.log("files = ", files);
  for (const file of files) {
    const pass = new PassThrough();

    const encodedFileName = encodeURIComponent(file.originalname);

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `wirewings-crm/${file.originalname}`,
        Body: pass,
        ContentType: file.mimetype,
        ContentDisposition: "inline",
      },
    });

    pass.end(file.buffer);
    await upload.done();
    // Convert S3 URL to CloudFront URL
    const s3Url = `${
      process.env.AWS_S3_BUCKET_URL
    }/purplebricks/${encodeURIComponent(file.originalname)}`;
    const cloudFrontUrl = convertS3ToCloudFrontUrl(s3Url); // Convert to CloudFront URL

    uploadedFiles.push({
      fieldname: file.fieldname,
      filename: encodedFileName,
      originalname: file.originalname,
      url: cloudFrontUrl,
    });
  }

  // console.log("uploadedFiles=", uploadedFiles);

  return uploadedFiles;
};
