const jwt = require("jsonwebtoken");
const DB = require("../models");
const ResponseAPI = require("../utils/response");
const sendMail = require("../utils/mailer");
const crypto = require("crypto");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const fs = require("fs");
const { imageUpload } = require("../utils/imageUtil");

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const userController = {
  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      const existingUser = await DB.User.findOne({ email });
      if (existingUser) {
        return ResponseAPI.conflict(res, "Email already exists");
      }

      if (password !== confirmPassword) {
        return ResponseAPI.badRequest(res, "Passwords do not match");
      }

      const user = await DB.User.create({ name, email, password });

      return ResponseAPI.created(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo_url: user.photo_url,
          },
        },
        "Registration successful"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await DB.User.findOne({ email });
      if (!user) {
        return ResponseAPI.notFound(res, "Email not found");
      }

      const newPassword = crypto.randomBytes(4).toString("hex");

      user.password = newPassword;
      await user.save();

      const emailContent = `
                <h3>Password Reset</h3>
                <p>Your password has been reset. Here is your new password:</p>
                <p><strong>${newPassword}</strong></p>
                <p>Please log in and change your password immediately.</p>
            `;

      await sendMail(user.email, "Password Reset Successful", emailContent);

      return ResponseAPI.success(
        res,
        null,
        "New password has been sent to your email"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await DB.User.findOne({ email });
      if (!user) {
        return ResponseAPI.error(res, "Invalid email or password", 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return ResponseAPI.error(res, "Invalid email or password", 401);
      }

      const token = generateToken(user._id);

      return ResponseAPI.success(
        res,
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo_url: user.photo_url,
          },
        },
        "Login successful"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async editProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await DB.User.findById(userId);
      if (!user) return ResponseAPI.notFound(res, "User not found");

      // Upload file kalau ada
      if (req.file) {
        const uploadResult = await imageUpload(req.file);
        user.photo_url = uploadResult.data.url;
      }

      // Update nama kalau ada
      if (req.body.name) {
        user.name = req.body.name;
      }

      await user.save();

      return ResponseAPI.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo_url: user.photo_url,
          },
        },
        "Profile updated successfully"
      );
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      return ResponseAPI.serverError(res, error);
    }
  },
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      const userId = req.user.id;

      const user = await DB.User.findById(userId);
      if (!user) {
        return ResponseAPI.notFound(res, "User not found");
      }

      const isOldPasswordValid = await user.comparePassword(oldPassword);
      if (!isOldPasswordValid) {
        return ResponseAPI.error(res, "Old password is incorrect", 401);
      }

      if (newPassword !== confirmNewPassword) {
        return ResponseAPI.badRequest(res, "New passwords do not match");
      }

      user.password = newPassword;
      await user.save();

      return ResponseAPI.success(res, null, "Password changed successfully");
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await DB.User.find({}, "name email role").exec();
      return ResponseAPI.success(
        res,
        users,
        "All users retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting all users:", error);
      return ResponseAPI.serverError(res, error);
    }
  },

  async getSummary(req, res) {
    try {
      const totalCustomers = await DB.User.countDocuments({ role: "customer" });

      const totalTickets = await DB.Ticket.countDocuments();

      const totalEvents = await DB.Event.countDocuments();

      const summary = {
        totalCustomers,
        totalTickets,
        totalEvents,
      };

      return ResponseAPI.success(
        res,
        summary,
        "Summary data retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async getUserBoxInfo(req, res) {
    try {
      const customerId = req.user.id;

      const totalTickets = await DB.Ticket.countDocuments({ customerId });

      const completedTransactions = await DB.Transaction.countDocuments({
        customerId,
        paymentStatus: "completed",
      });

      const totalAmountData = await DB.Transaction.aggregate([
        {
          $match: {
            customerId: new mongoose.Types.ObjectId(customerId),
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalAmount =
        totalAmountData.length > 0 ? totalAmountData[0].totalAmount : 0;

      return ResponseAPI.success(
        res,
        {
          totalTickets,
          completedTransactions,
          totalAmount,
        },
        "User box info retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await DB.User.findById(userId);

      if (!user) {
        return ResponseAPI.notFound(res, "User not found");
      }

      if (user.role === "admin") {
        return ResponseAPI.forbidden(res, "Cannot delete admin user");
      }

      const transactionCount = await DB.Transaction.countDocuments({
        customerId: userId,
      });
      if (transactionCount > 0) {
        return ResponseAPI.forbidden(
          res,
          "Cannot delete user with existing transactions"
        );
      }

      await user.deleteOne();
      return ResponseAPI.success(res, null, "User deleted successfully");
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = userController;
