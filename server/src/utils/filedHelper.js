export function generateFileUrl(req, filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const baseUrl =
    process.env.BASE_URL || `${req.protocol}://${req.headers.host}`;

  return `${baseUrl}/${normalizedPath}`;
}
