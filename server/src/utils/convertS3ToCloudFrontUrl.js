export const convertS3ToCloudFrontUrl = (s3Url) => {
  if (!s3Url) return null;
  return s3Url.replace(
    process.env.AWS_S3_BUCKET_URL,
    process.env.AWS_CLOUDFRONT_URL
  );
};
