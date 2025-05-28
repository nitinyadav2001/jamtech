import express from "express";
import fileExplorerController from "../../controllers/fileExplorer/fileExplorerController.js";
import upload from "../../middlewares/fileUpload.js";
const router = express.Router();

// Folder routes
router.post("/folders", fileExplorerController.createFolder);
router.get("/folders/tree", fileExplorerController.getFolderTree);

// File routes
router.post(
  "/upload",
  upload.single("path"),
  fileExplorerController.uploadFile
);

// export default router;
export default router;
