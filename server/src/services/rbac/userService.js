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

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        include: {
          role: true,
        },
      });

      if (!users) {
        throw new Error("Current user not found.");
      }

      return users;
    } catch (error) {
      console.log(error);
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

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
};

export default userService;
