import bcrypt from "bcrypt";
import validateMandatoryFields from "../../utils/validateFields.js";
import jwt from "jsonwebtoken";
import prisma from "../../config/prismaClient.js";

const userService = {
  async createUser(data) {
    let { fullName, email, phone, password, roleId, profileImage, dob } = data;

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { phone: phone }],
        },
      });

      if (existingUser) {
        throw new Error("User with this email or phone already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          password: hashedPassword,
          role: {
            connect: {
              id: roleId,
            },
          },
          profileImage,
          dob: dob,
        },
      });

      return newUser;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  async loginUser(data, req) {
    let { emailOrPhone, password } = data;

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        },
        include: {
          role: true,
        },
      });

      // Check if the user exists
      if (!user) {
        throw new Error(
          "The provided credential is incorrect. Please check your credentials and try again."
        );
      }

      if (user.isActive !== true) {
        throw new Error(
          "Your account is currently frozen. Please contact your administrator for assistance."
        );
      }
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid login credentials");
      }

      req.session.user = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      };

      return user;
    } catch (error) {
      console.log(error);
      throw new Error(`${error.message}`);
    }
  },

  //logout user.....................................
  async logoutUser(req) {
    try {
      // Destroy the session to log the user out
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            return reject(new Error("Error logging out"));
          }
          resolve();
        });
      });

      // Clear the session cookie
      req.session = null;

      return { message: "Logout successful" };
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  },

  // Forgot password using either email or phone, and create a session
  async forgotPassowrd(userData) {
    const { email } = userData;
    if (!email) {
      throw new Error("Invalid login credentials");
    }

    try {
      // Find the user by email or phone based on the input type
      const user = await prisma.user.findUnique({ where: { email } });
      // Check if the user exists
      if (!user) {
        throw new Error("User not found!"); // Generic error message
      }

      const resetToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}/${user.id}`;
      const message = ` We received a request to reset your password. If you didn’t make this request, you can ignore this email. Otherwise, click the button below to reset your password.`;
      console.log("resetURL=", resetURL);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to: user.email,
        subject: "Reset Your Password",
        html: `
       <div style="
      max-width: 80%;
      margin: 40px auto;
      padding: 20px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-family: Arial, sans-serif;
    ">
  
  <!-- Organization Logo -->
  <img src="https://crm.new.wirewings.in/assets/logo1-BnTyTWn1.png" alt="Organization Logo" 
       style="max-width: 100px; margin-bottom: 15px;" />

  <!-- Email Message -->
  <p style="font-size: 16px; color: #333; line-height: 1.5;">
    Hello, <br><br>
   ${message}
  </p>

  <!-- Reset Button -->
  <a href="${resetURL}" 
     style="
       display: inline-block;
       padding: 12px 20px;
       font-size: 16px;
       color: #fff;
       background-color: #000;
       text-decoration: none;
       border-radius: 5px;
       margin-top: 15px;
       font-weight: bold;
     "
     target="_blank">
    Reset Password
  </a>

  <!-- Footer Message -->
  <p style="font-size: 12px; color: #777; margin-top: 15px;">
    If you have any issues, please contact our support team.
  </p>
</div>

      `,
      });

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordTokenExpiry: resetTokenExpiry,
        },
      });

      return { message: "Reset password link sent to your email!" };
    } catch (error) {
      console.log(error);
      throw new Error(`${error.message}`);
    }
  },

  //  Reset your password....................
  async resetPassword(data) {
    const { password, token, userId } = data;
    try {
      const checkUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!checkUser) {
        throw new Error("Invalid user");
      }
      if (token !== checkUser.resetPasswordToken) {
        throw new Error("Invalid token");
      }

      if (new Date() > checkUser.resetPasswordTokenExpiry) {
        return res.status(400).json({ message: "Token has expired." });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const verify = jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, decoded) => {
          if (err) {
            throw new Error("Invalid token/expired token.");
          }
        }
      );

      await prisma.user.update({
        where: {
          id: checkUser.id,
        },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
        },
      });

      return { message: "Password reset successfully" };
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  },

  // 4. Fetch a user by ID
  async getUserById(userId) {
    console.log("userId = ", userId);
    // Validate that userId is provided and is a number or a UUID
    if (!userId) {
      throw new Error("Invalid or missing userId");
    }

    try {
      // Fetch user by ID from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: true, department: true }, // Include role permissions
              },
            },
          },
          permissions: {
            include: {
              permission: true,
            },
          }, // Include user-specific permissions
        },
      });

      // If the user does not exist
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  },
  async userProfileUpdate(userId, profileImageUrl) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: profileImageUrl },
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update profile picture: ${error.message}`);
    }
  },

  // 5. Fetch all users
  // async getAllUsers({
  //   page = 1,
  //   pageSize = 10,
  //   sortBy = "id",
  //   order = "asc",
  //   search = "",
  //   filters = {},
  // }) {
  //   try {
  //     // Apply pagination using the utility function
  //     const { skip, take, paginationInfo } = applyPagination(page, pageSize);

  //     // Apply sorting using the utility function
  //     const orderBy = applySorting(sortBy, order, [
  //       "id",
  //       "username",
  //       "email",
  //       "createdAt",
  //     ]);

  //     // Apply filtering using the utility function
  //     const filterConditions = applyFiltering(filters);

  //     // Apply search using the utility function
  //     const searchFilter = applySearch(search, ["username", "email", "phone"]);

  //     // Combine the filters and search conditions
  //     const where = {
  //       AND: [filterConditions, searchFilter],
  //     };

  //     // Fetch users with pagination, sorting, filtering, and search features
  //     const users = await prisma.user.findMany({
  //       skip,
  //       take,
  //       where,
  //       orderBy,
  //       include: {
  //         roles: {
  //           include: {
  //             role: {
  //               include: { permissions: true }, // Include role permissions
  //             },
  //           },
  //         },
  //         permissions: true, // Include user-specific permissions
  //       },
  //     });

  //     // Get total count of users based on the applied filters
  //     const totalUsers = await prisma.user.count({
  //       where,
  //     });

  //     return {
  //       users,
  //       ...paginationInfo,
  //       totalUsers,
  //       totalPages: Math.ceil(totalUsers / pageSize),
  //     };
  //   } catch (error) {
  //     throw new Error(`Error fetching users: ${error.message}`);
  //   }
  // },
  async getAllUsers({
    userId, // Pass the current user's ID
    page = 1,
    pageSize = 100,
    sortBy = "id",
    order = "asc",
    search = "",
    filters = {},
    departmentId,
  }) {
    try {
      // Fetch the current user's details, including role and rank
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true, // Include role information
            },
          },
        },
      });

      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      // Extract current user's role and rank
      const currentRoleName = currentUser.roles[0]?.role?.name || null;
      const currentRank = currentUser.roles[0]?.role?.rank || null;

      if (!currentRoleName || currentRank === null) {
        throw new Error("Current user's role or rank is missing.");
      }

      // Apply pagination using the utility function
      const { skip, take, paginationInfo } = applyPagination(page, pageSize);

      // Apply sorting using the utility function
      const orderBy = applySorting(sortBy, order, [
        "id",
        "username",
        "email",
        "createdAt",
      ]);

      // Apply filtering using the utility function
      const filterConditions = applyFiltering(filters);

      // Apply search using the utility function
      const searchFilter = applySearch(search, ["username", "email", "phone"]);

      // Initialize the base filter
      let where = {
        AND: [filterConditions, searchFilter],
      };

      // Check if the user is Admin or Director
      if (currentRoleName === "Admin" || currentRoleName === "Director") {
        // Admins and Directors get access to all users
      } else {
        // Restrict access based on rank
        where = {
          ...where,
          AND: [
            {
              roles: {
                some: {
                  role: {
                    rank: {
                      gte: currentRank, // Allow access to users with equal or lower ranks
                    },
                  },
                },
              },
            },
          ],
        };
      }

      if (departmentId !== null && departmentId !== "") {
        where = {
          ...where,
          AND: [
            {
              roles: {
                some: {
                  role: {
                    departmentId: departmentId,
                  },
                },
              },
            },
          ],
        };
      }

      if (search !== null && search !== "") {
        where = {
          ...where,
          AND: [
            {
              OR: [
                { username: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            },
          ],
        };
      }

      // Fetch users with pagination, sorting, filtering, and search features
      const users = await prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: true, department: true }, // Include role permissions
              },
            },
          },

          permissions: {
            include: {
              permission: true,
            },
          }, // Include user-specific permissions
        },
      });

      // Get total count of users based on the applied filters
      const totalUsers = await prisma.user.count({
        where,
      });

      return {
        users,
        ...paginationInfo,
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

  //Fetch department wise users.................................
  // Fetch department wise users.................................

  async getAllUsersDepartmentWise({
    userId,
    page = 1,
    pageSize = 100,
    sortBy = "id",
    order = "asc",
    search = "",
    filters = {},
    department, // department = module name like "Sales" or "Development"
  }) {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
      });

      if (!currentUser) throw new Error("Current user not found.");

      const currentRoleName = currentUser.roles[0]?.role?.name || null;
      const currentRank = currentUser.roles[0]?.role?.rank || null;
      const userDepartmentIds = currentUser.roles.map(
        (r) => r.role.departmentId
      );

      if (!currentRoleName || currentRank === null) {
        throw new Error("Current user's role or rank is missing.");
      }

      const { skip, take, paginationInfo } = applyPagination(page, pageSize);
      const orderByClause = applySorting(sortBy, order, [
        "id",
        "username",
        "email",
        "createdAt",
      ]);
      const filterConditions = applyFiltering(filters);
      const searchFilter = applySearch(search, ["username", "email", "phone"]);

      // Start building AND condition filters
      const andConditions = [filterConditions, searchFilter];

      if (currentRoleName === "Admin" || currentRoleName === "Director") {
        // If department/module is provided, filter only users of that department
        if (department) {
          andConditions.push({
            roles: {
              some: {
                role: {
                  department: {
                    name: department,
                  },
                },
              },
            },
          });
        }
      } else {
        // For normal users, restrict by department and rank
        const roleFilter = {
          roles: {
            some: {
              role: {
                departmentId: {
                  in: userDepartmentIds,
                },
                rank: {
                  gte: currentRank,
                },
              },
            },
          },
        };

        andConditions.push(roleFilter);

        // If module (department name) is selected, also apply department filter
        if (department) {
          andConditions.push({
            roles: {
              some: {
                role: {
                  department: {
                    name: department,
                  },
                },
              },
            },
          });
        }
      }

      const where = { AND: andConditions };

      const users = await prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderByClause,
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: true, department: true },
              },
            },
          },
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      const totalUsers = await prisma.user.count({ where });

      return {
        users,
        ...paginationInfo,
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },
  //user status ACTIVE/INACTIVE.................................
  async userStatusUpdate(data) {
    const { userId, status } = data;
    try {
      if (status !== "ACTIVE" && status !== "INACTIVE") {
        throw new Error("Invalid status");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: status },
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  },
  //Update User access role...................................
  async userAccessRoleUpdate(data) {
    const { userId, role } = data;
    try {
      // Fetch the current user's details, including role and rank
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true, // Include role information
            },
          },
        },
      });

      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      // Delete existing role
      await prisma.userRole.deleteMany({
        where: { userId: currentUser.id },
      });

      // Create new role
      const roleUpdate = await prisma.userRole.create({
        data: {
          userId: currentUser.id,
          roleId: role,
        },
      });

      return roleUpdate;
    } catch (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }
  },

  //get the name of id all Company employees. {FOR TASK ASSIGNING PURPOSE}
  async getUserOptions() {
    console.log("inside options service ");
    try {
      const userOptions = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      });
      return userOptions;
    } catch (error) {
      throw new Error(`Error fetching user options: ${error.message}`);
    }
  },

  // 6. Update user information (including phone)
  async updateUser(userId, data) {
    try {
      // Ensure the user exists before attempting to update
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Destructure the data provided for updating
      const {
        username,
        email,
        phone,
        password,
        fullName,
        notificationSound,
        ...otherFields
      } = data;

      // Prepare the update object
      let updatedData = {};

      // Update username if provided
      if (username) {
        updatedData.username = username.trim();
      }

      // Update email if provided
      if (email) {
        // Validate email format (you can use a library like validator.js)
        if (!validator.isEmail(email.trim())) {
          throw new Error("Invalid email format");
        }
        updatedData.email = email.trim();
      }

      // Update phone if provided
      if (phone) {
        // Validate phone format (use validator for phone number validation)
        if (!validator.isMobilePhone(phone.trim(), "any")) {
          throw new Error("Invalid phone number format");
        }
        updatedData.phone = phone.trim();
      }

      // Update full name if provided
      if (fullName) {
        updatedData.fullName = fullName.trim();
      }

      // Update password if provided (hash it before saving)
      if (password) {
        if (password && password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        updatedData.password = await bcrypt.hash(password.trim(), SALT_ROUNDS);
      }

      if (notificationSound) {
        updatedData.notificationSound = notificationSound;
      }

      // Add any other additional fields
      Object.assign(updatedData, otherFields);

      // Perform the update in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  async getSubordinates(userId) {
    try {
      // Fetch the logged-in user's data, including their department and role rank
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          team: {
            include: {
              department: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      // Get the user's department and minimum rank (if multiple roles)
      const departmentId = user.team?.department?.id;
      const userRank = Math.min(...user.roles.map((role) => role.role.rank));

      if (!departmentId) {
        throw new Error("User does not belong to any department.");
      }

      // Fetch all subordinates with a lower rank in the same department
      const subordinates = await prisma.user.findMany({
        where: {
          AND: [
            { team: { departmentId: departmentId } }, // Same department
            {
              roles: {
                some: {
                  role: {
                    rank: {
                      gt: userRank, // Lower rank
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          team: true,
        },
      });
      console.log("subordinates====>", subordinates);
      return subordinates;
    } catch (error) {
      throw new Error(`Error fetching subordinates: ${error.message}`);
    }
  },

  // Search users by name, email, or ID
  // async searchUsers(query) {
  //   try {
  //     const trimmedQuery = query.trim(); // Remove any extra spaces
  //     const queryWords = trimmedQuery.split(" "); // Split the name into individual words

  //     // Build the query to match any part of the name, email, or ID
  //     const users = await prisma.user.findMany({
  //       where: {
  //         OR: [
  //           // Search by each part of the name
  //           {
  //             AND: queryWords.map((word) => ({
  //               fullName: {
  //                 contains: word,
  //                 mode: "insensitive",
  //               },
  //             })),
  //           },
  //           {
  //             email: {
  //               contains: trimmedQuery,
  //               mode: "insensitive",
  //             },
  //           },
  //           {
  //             userId: {
  //               equals: parseInt(trimmedQuery) || 0, // Search by userId if the query is a number
  //             },
  //           },
  //         ],
  //       },
  //       include: {
  //         roles: {
  //           include: {
  //             role: true,
  //           },
  //         },
  //         team: {
  //           include: {
  //             leader: true, // Include leader information for hierarchy reference
  //           },
  //         },
  //       },
  //     });

  //     return users;
  //   } catch (error) {
  //     throw new Error("Error fetching search results: " + error.message);
  //   }
  // },
  async searchUsers(query, currentUserId) {
    try {
      // Fetch the current user's details, including role and rank
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      const currentRole = currentUser.roles[0]?.role?.name || null;
      const currentRank = currentUser.roles[0]?.role?.rank || null;

      if (!currentRole || currentRank === null) {
        throw new Error("Current user role or rank not found.");
      }

      // Prepare the search query
      const trimmedQuery = query.trim(); // Remove any extra spaces
      const queryWords = trimmedQuery.split(" "); // Split the name into individual words

      // Base filter: Search query
      let baseFilter = {
        OR: [
          // Search by each part of the name
          {
            AND: queryWords.map((word) => ({
              fullName: {
                contains: word,
                mode: "insensitive",
              },
            })),
          },
          {
            email: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
          {
            userId: {
              equals: parseInt(trimmedQuery) || 0, // Search by userId if the query is a number
            },
          },
        ],
      };

      // Role & Rank-Based Filtering
      if (currentRole === "Admin" || currentRole === "Director") {
        // Admins and Directors can search all users
      } else {
        // Restrict users based on rank (same rank or higher)
        baseFilter = {
          AND: [
            baseFilter, // Apply the search query
            {
              roles: {
                some: {
                  role: {
                    rank: {
                      gte: currentRank, // Include roles with rank >= current user's rank
                    },
                  },
                },
              },
            },
          ],
        };
      }

      // Perform the search with the final filter
      const users = await prisma.user.findMany({
        where: baseFilter,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return users;
    } catch (error) {
      throw new Error("Error fetching search results: " + error.message);
    }
  },

  async getUserHierarchyPath(userId) {
    let path = [];
    let currentUserId = userId;

    try {
      while (currentUserId) {
        // Fetch the current user, role, and department
        const user = await prisma.user.findUnique({
          where: { id: currentUserId },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    department: true, // Include department details
                  },
                },
              },
            },
          },
        });

        if (!user) {
          console.log("No user found with ID:", currentUserId);
          break;
        }

        // Determine the user's current role, rank, and department
        const currentRole = user.roles[0]?.role?.name || "No Role Assigned";
        const currentRank = user.roles[0]?.role?.rank || null;
        const departmentId = user.roles[0]?.role?.department?.id;
        const departmentName =
          user.roles[0]?.role?.department?.name || "No Department Assigned";

        // Fetch users with the same role and department.............
        const sameDepartmentUsers = await prisma.user.findMany({
          where: {
            roles: {
              some: {
                role: {
                  name: currentRole,
                  departmentId, // Match the department
                },
              },
            },
          },
          select: {
            id: true,
            fullName: true,
            roles: {
              include: {
                role: true,
              },
            },
            email: true, // Include additional details as needed
          },
        });

        // Count users with the same role and department
        const sameRoleCount = sameDepartmentUsers.length;

        // Add the current user to the path with details
        path.push({
          id: user.id,
          fullName: user.fullName,
          role: currentRole,
          rank: currentRank,
          department: departmentName,
          sameRoleCount,
          sameDepartmentUsers, // Include detailed info of users with the same role and department
        });

        console.log(
          `User ID: ${user.id}, Name: ${user.fullName}, Role: ${currentRole}, Same Role Count: ${sameRoleCount}`
        );

        if (!currentRank || currentRank === 1) {
          console.log("Reached the top of the hierarchy or user has no rank.");
          break; // Stop if Admin or rank is undefined
        }

        // Fetch the immediate superior with the next higher rank
        const superior = await prisma.user.findFirst({
          where: {
            roles: {
              some: {
                role: {
                  rank: currentRank - 1, // Immediate higher rank
                  departmentId, // Same department
                },
              },
            },
          },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        });

        if (!superior) {
          console.log(`No superior found for rank: ${currentRank - 1}`);
          break; // Stop if no superior is found
        }

        console.log(
          `Found superior: ${superior.fullName} (Rank: ${
            superior.roles[0]?.role?.rank || "No Rank"
          })`
        );

        currentUserId = superior.id; // Move to the superior's ID
      }

      // Reverse the path to display the hierarchy from top-down
      console.log("Final hierarchy path:", path);
      return path;
    } catch (error) {
      console.error("Error in getUserHierarchyPath:", error);
      throw new Error("Failed to construct user hierarchy path.");
    }
  },

  // async getUserHierarchyPath(userId) {
  //   let path = [];
  //   let currentUserId = userId;

  //   try {
  //     while (currentUserId) {
  //       // Fetch the current user and their role
  //       const user = await prisma.user.findUnique({
  //         where: { id: currentUserId },
  //         include: {
  //           roles: {
  //             include: {
  //               role: true, // Include role to get rank
  //             },
  //           },
  //         },
  //       });

  //       if (!user) {
  //         console.log("No user found with ID:", currentUserId);
  //         break;
  //       }

  //       // Add the current user to the path
  //       path.push({
  //         id: user.id,
  //         fullName: user.fullName,
  //         role: user.roles[0]?.role?.name || "No Role Assigned",
  //         rank: user.roles[0]?.role?.rank || null,
  //       });

  //       // Determine the rank of the current user
  //       const currentRank = user.roles[0]?.role?.rank || null;
  //       console.log(
  //         `User ID: ${user.id}, Name: ${user.fullName}, Rank: ${currentRank}`
  //       );

  //       if (!currentRank || currentRank === 1) {
  //         console.log("Reached the top of the hierarchy or user has no rank.");
  //         break; // Stop if Admin or rank is undefined
  //       }

  //       // Fetch the immediate superior with the next higher rank
  //       const superior = await prisma.user.findFirst({
  //         where: {
  //           roles: {
  //             some: {
  //               role: {
  //                 rank: currentRank - 1, // Immediate higher rank
  //               },
  //             },
  //           },
  //         },
  //         include: {
  //           roles: {
  //             include: {
  //               role: true,
  //             },
  //           },
  //         },
  //       });

  //       // console.log("superior===>", superior);
  //       if (!superior) {
  //         console.log(`No superior found for rank: ${currentRank - 1}`);
  //         break; // Stop if no superior is found
  //       }

  //       console.log(
  //         `Found superior: ${superior.fullName} (Rank: ${
  //           superior.roles[0]?.role?.rank || "No Rank"
  //         })`
  //       );

  //       currentUserId = superior.id; // Move to the superior's ID
  //     }

  //     // Reverse the path to display the hierarchy from top-down
  //     console.log("Final hierarchy path:", path);
  //     return path;
  //   } catch (error) {
  //     console.error("Error in getUserHierarchyPath:", error);
  //     throw new Error("Failed to construct user hierarchy path.");
  //   }
  // },
};

export default userService;
