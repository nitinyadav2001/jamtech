// upload.mjs
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../../../../../../shoora-jewels/server/config/aws-config.js"; // Import the S3 configuration

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `images/${file.originalname}`); // Keep the original file name
    },
  }),
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB

  // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
  // fileFilter: function (req, file, cb) {
  //   const filetypes = /jpeg|jpg|png/;
  //   const extname = filetypes.test(
  //     path.extname(file.originalname).toLowerCase()
  //   );
  //   const mimetype = filetypes.test(file.mimetype);
  //   if (mimetype && extname) {
  //     return cb(null, true);
  //   } else {
  //     cb("Error: Allow images only of extensions jpeg|jpg|png !");
  //   }
  // },
});
