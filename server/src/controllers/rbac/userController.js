import userService from "../../services/rbac/userService.js";
import { uploadFilesToS3 } from "../../middlewares/rbac/aws.file.stream.js";

const userController = {
  async createUser(req, res, next) {
    try {
      let userData = req.body;

      // Upload files and get metadata
      const uploadedFiles = (await uploadFilesToS3(req.files)) || [];

      // Match uploaded profile picture URL
      const profilePictureUrl = uploadedFiles ? uploadedFiles[0]?.url : null;
      // Add to user data
      userData = {
        ...userData,
        profileImage: profilePictureUrl || null,
      };
      console.log("userdata", userData);
      const newUser = await userService.createUser(userData);

      return res.status(201).json({
        success: true,
        newUser,
      });
    } catch (error) {
      console.error("User creation error:", error);
      next(error);
    }
  },

  async updateProfilePicture(req, res, next) {
    try {
      const { userId } = req.params;

      console.log("Uploaded files:", req.files);

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // 🟡 Find the file with fieldname "profilePicture"
      const profilePicFile = req.files.find(
        (file) => file.fieldname === "profileImage"
      );

      if (!profilePicFile) {
        return res
          .status(400)
          .json({ success: false, message: "profile Image not found" });
      }

      // 🟢 Upload the profile picture file
      const uploaded = await uploadFilesToS3([profilePicFile]);
      const imageUrl = uploaded[0]?.url;

      if (!imageUrl) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      }

      // 📝 Update user with profileImage URL
      const updatedUser = await userService.userProfileUpdate(userId, imageUrl);

      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        imageUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile picture update error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  async loginUser(req, res) {
    const { emailOrPhone, password } = req.body;

    // Validate required fields
    if (!emailOrPhone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    try {
      const user = await userService.loginUser({ emailOrPhone, password }, req);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async logoutUser(req, res) {
    try {
      await userService.logoutUser(req, res);
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async getUserById(req, res) {
    const userId = req.params.userId;

    // Validate userId (could be a UUID or number depending on implementation)
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
      const user = await userService.getUserById(userId);
      return res.status(200).json(user);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  },

  async getAllUsers(req, res) {
    const { page, pageSize, sortBy, order, search, filters, departmentId } =
      req.query;
    const userId = req.session?.user?.id;
    // console.log("session user=", userId);
    try {
      const users = await userService.getAllUsers({
        page,
        pageSize,
        sortBy,
        order,
        search,
        filters,
        userId,
        departmentId,
      });
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  },
};

export default userController;
