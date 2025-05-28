import prisma from "../../config/prismaClient.js";
import { generateFileUrl } from "../../utils/filedHelper.js";

const fileExplorerServices = {
  async createFolder(name, parentId, createdById) {
    return await prisma.folder.create({
      data: {
        name,
        parentId,
        createdById,
      },
    });
  },

  async uploadFile(file, folderId, uploadedById, fileUrl) {
    if (!file) throw new Error("File is required");
    return await prisma.file.create({
      data: {
        name: file.originalname,
        path: fileUrl,
        fileType: file.originalname.split(".").pop().toLowerCase(),
        folderId,
        uploadedById,
      },
    });
  },

  async getFolderTree() {
    const buildTree = async (parentId = null) => {
      const folders = await prisma.folder.findMany({
        where: { parentId },
        include: {
          files: true,
          children: true,
        },
      });

      return await Promise.all(
        folders.map(async (folder) => ({
          id: folder.id,
          name: folder.name,
          files: folder.files,
          children: await buildTree(folder.id),
        }))
      );
    };

    return await buildTree();
  },
};

export default fileExplorerServices;
