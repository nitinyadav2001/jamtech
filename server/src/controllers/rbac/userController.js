import userService from "../../services/rbac/userService.js";
import xlsx from "xlsx";
import validator from "validator"; // For additional validation
import { uploadFilesToS3 } from "../../middlewares/rbac/aws.file.stream.js";

// Controller for managing users
const userController = {
  // 1. Create a new User with input validation
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

  async createUsersBulk(req, res) {
    try {
      // Step 1: Check if the file is provided
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded. Please provide an Excel file." });
      }

      // Step 2: Read the Excel file buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet data to JSON format
      const usersData = xlsx.utils.sheet_to_json(worksheet);

      // Step 3: Pass the user data to the service
      const result = await userService.createUsersBulk(usersData);

      // Step 4: Return response
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
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

  // 2. Login User with input validation
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
  // Forgot password with input validation
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const userData = { email };
      if (!email) {
        return res
          .status(400)
          .json({ message: "email is required", fields: ["email"] });
      }
      const data = await userService.forgotPassowrd(userData);
      return res.status(201).json(data);
    } catch (error) {
      res.status(500).send("Something went wrong");
    }
  },
  // 2. Login User with input validation
  async resetPassword(req, res) {
    try {
      const { token, password, userId } = req.body;
      console.log("body data=", req.body);
      const resetData = { token, password, userId };

      if (!password) {
        return res
          .status(400)
          .json({ message: "password is required", fields: ["password"] });
      }
      const data = await userService.resetPassword(resetData);

      res.status(200).json(data);
    } catch (error) {
      res.status(500).send("Something went wrong");
    }
  },

  // 3. Logout User
  async logoutUser(req, res) {
    try {
      await userService.logoutUser(req, res);
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 4. Get a User by ID
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

  // 5. Get All Users with query parameters (pagination, sorting, search, filtering)
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
  //user active/inactive..........................................................
  async userActiveInactive(req, res) {
    const { userId, status } = req.body;
    try {
      if (!userId || !status) {
        res
          .status(400)
          .json({ message: "Please User Id / isActive is required!" });
      }
      const users = await userService.userStatusUpdate(req.body);
      console.log(users);
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.log("Error Occurred this one", error);
      return res.status(400).json({ error: error.message });
    }
  },
  // 5. Get All Users with query parameters (pagination, sorting, search, filtering)
  async getAllUsersDepartmentWise(req, res) {
    const { department } = req.params;
    const { page, pageSize, sortBy, order, search, filters } = req.query;
    const userId = req.session?.user?.id;
    // console.log("session user=", userId);
    try {
      const users = await userService.getAllUsersDepartmentWise({
        page,
        pageSize,
        sortBy,
        order,
        search,
        filters,
        userId,
        department,
      });
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  },
  async getUserOptions(req, res) {
    try {
      const users = await userService.getUserOptions();
      console.log(users);
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.log("Error Occurred this one", error);
      return res.status(400).json({ error: error.message });
    }
  },
  async userAccessRoleUpdate(req, res) {
    const { userId, role } = req.body;
    try {
      if (!userId || !role) {
        res
          .status(400)
          .json({ message: "Please User Id / Role Id is required!" });
      }
      const users = await userService.userAccessRoleUpdate(req.body);
      console.log(users);
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.log("Error Occurred this one", error);
      return res.status(400).json({ error: error.message });
    }
  },

  // 6. Update a User with input validation
  async updateUser(req, res) {
    const userId = req.params.userId;
    const { username, email, phone, password, fullName, notificationSound } =
      req.body;

    // Validate userId
    if (
      !userId ||
      (!validator.isNumeric(userId) && !validator.isUUID(userId))
    ) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // // Validate input for update (at least one field must be provided)
    // if (!username && !email && !phone && !password && !fullName) {
    //   return res
    //     .status(400)
    //     .json({ error: "At least one field must be provided for update" });
    // }

    // // Optional: Validate email and phone format here (already done in service)
    // if (email && !validator.isEmail(email)) {
    //   return res.status(400).json({ error: "Invalid email format" });
    // }
    // if (phone && !validator.isMobilePhone(phone, "any")) {
    //   return res.status(400).json({ error: "Invalid phone number format" });
    // }

    try {
      const updatedUser = await userService.updateUser(userId, {
        username,
        email,
        phone,
        password,
        fullName,
        notificationSound,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  },

  async getSubordinates(req, res) {
    try {
      const { id: userId } = req.session.user; // Assuming session contains logged-in user ID
      const subordinates = await userService.getSubordinates(userId);
      return res.status(200).json({ success: true, data: subordinates });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  // Search Users by name, email, or ID
  async searchUsers(req, res) {
    const { query, currentUserId } = req.query;

    // console.log("search query", query);

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    try {
      const users = await userService.searchUsers(query, currentUserId);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get User Hierarchy Path
  async getUserHierarchyPath(req, res) {
    const userId = req.params.userId;

    try {
      const hierarchyPath = await userService.getUserHierarchyPath(userId);
      return res.status(200).json(hierarchyPath);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

export default userController;
