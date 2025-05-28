// export function generateFileUrl(req, filePath) {
//   const normalizedPath = filePath.replace(/\\/g, "/");
//   const baseUrl =
//     process.env.BASE_URL || `${req.protocol}://${req.headers.host}`;

//   return `${baseUrl}/${normalizedPath}`;
// }

export function generateFileUrl(req, filePath) {
  if (!filePath) {
    throw new Error("filePath is required to generate URL");
  }
  console.log("filePath=", filePath);
  const normalizedPath = filePath.replace(/\\/g, "/");
  const baseUrl =
    process.env.BASE_URL || `${req.protocol}://${req.headers.host}`;

  return `${baseUrl}/${normalizedPath}`;
}
