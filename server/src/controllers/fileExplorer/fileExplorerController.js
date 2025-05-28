import fileExplorerServices from "../../services/fileExplorer/fileExplorerServices.js";
import { generateFileUrl } from "../../utils/filedHelper.js";

const fileExplorerController = {
  async createFolder(req, res) {
    try {
      const folder = await fileExplorerServices.createFolder(
        req.body.name,
        req.body.parentId,
        req.session.user.id
      );
      res.status(201).json(folder);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async uploadFile(req, res) {
    try {
      const fileUrl = generateFileUrl(req, req.file.path);
      const file = await fileExplorerServices.uploadFile(
        req.file,
        req.body.folderId,
        req.session.user.id,
        fileUrl
      );
      res.status(201).json(file);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getFolderTree(req, res) {
    try {
      const tree = await fileExplorerServices.getFolderTree();
      res.json(tree);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

export default fileExplorerController;
