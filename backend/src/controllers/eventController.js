const DB = require("../models");
const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const fs = require("fs");
const { imageUpload } = require("../utils/imageUtil");

const eventController = {
  async getAllAdmin(req, res) {
    try {
      const events = await DB.Event.find().sort({ dateTime: 1 });

      return ResponseAPI.success(res, events, "Events retrieved successfully");
    } catch (error) {
      return ResponseAPI.error(res, error);
    }
  },

  async getAll(req, res) {
    try {
      const now = new Date();

      const events = await DB.Event.find({ dateTime: { $gte: now } }).sort({
        dateTime: 1,
      });

      return ResponseAPI.success(res, events, "Events retrieved successfully");
    } catch (error) {
      return ResponseAPI.error(res, error);
    }
  },

  async getUpcomingEvents(req, res) {
    try {
      const now = new Date();

      const upcomingEvents = await DB.Event.find({ dateTime: { $gte: now } })
        .sort({ dateTime: 1 })
        .limit(4);

      return ResponseAPI.success(
        res,
        upcomingEvents,
        "Upcoming events retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.error(res, error);
    }
  },

  async getRecommendedEvents(req, res) {
    try {
      const now = new Date();

      const recommendedEvents = await DB.Event.find({
        dateTime: { $gte: now },
      })
        .sort({ quota: -1 })
        .limit(3);

      // Kirimkan response
      return ResponseAPI.success(
        res,
        recommendedEvents,
        "Recommended events retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.error(res, error.message);
    }
  },

  async getById(req, res) {
    try {
      const event = await DB.Event.findById(req.params.id);
      return ResponseAPI.success(res, event);
    } catch (error) {
      return ResponseAPI.error(res, error.message);
    }
  },

  async create(req, res) {
    try {
      const event = await DB.Event.create(req.body);

      if (req.file) {
        const urlUploadResult = await imageUpload(req.file);

        event.posterUrl = urlUploadResult.data.url;
      } else {
        return ResponseAPI.badRequest(res, "Banner event is required");
      }

      await event.save();

      return ResponseAPI.success(res, event);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return ResponseAPI.error(res, error.message);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseAPI.badRequest(res, "ID not provided");
      }

      const event = await DB.Event.findById(id);
      if (!event) {
        return ResponseAPI.notFound(res, "Event not found");
      }

      // update field manual (PENTING)
      event.name = req.body.name;
      event.dateTime = new Date(req.body.dateTime);
      event.location = req.body.location;
      event.description = req.body.description;
      event.quota = Number(req.body.quota);
      event.ticketPrice = Number(req.body.ticketPrice);
      event.eventBy = req.body.eventBy;

      // jika upload gambar baru
      if (req.file) {
        const uploadResult = await imageUpload(req.file);
        event.posterUrl = uploadResult.data.url;
      }

      await event.save();

      return ResponseAPI.success(res, event, "Event updated successfully");
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return ResponseAPI.error(res, error.message);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseAPI.error(res, "ID not provided!", 400);
      }

      const transactionExists = await DB.Transaction.exists({ eventId: id });

      if (transactionExists) {
        return ResponseAPI.error(
          res,
          "Cannot delete event because it is associated with existing transactions.",
          400
        );
      }

      const event = await DB.Event.findByIdAndDelete(id);

      if (!event) {
        return ResponseAPI.notFound(res, "Event not found!");
      }

      return ResponseAPI.success(res, event, "Event deleted successfully");
    } catch (error) {
      return ResponseAPI.error(res, error.message);
    }
  },

  async search(req, res) {
    try {
      const { keyword } = req.query;

      if (!keyword || keyword.trim() === "") {
        return ResponseAPI.badRequest(res, "Keyword is required for search");
      }

      const searchRegex = new RegExp(`\\b${keyword}`, "i");

      const now = new Date();

      const events = await DB.Event.find({
        dateTime: { $gte: now },
        $or: [
          { name: { $regex: searchRegex } },
          { eventBy: { $regex: searchRegex } },
        ],
      });

      if (events.length === 0) {
        return ResponseAPI.notFound(
          res,
          "No events found matching the keyword"
        );
      }

      return ResponseAPI.success(
        res,
        events,
        "Search results retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },

  async getTransactionSummaryByEvent(req, res) {
    const { eventId } = req.params;

    if (!eventId) {
      return ResponseAPI.badRequest(res, "Event ID is required");
    }

    try {
      const summary = await DB.Transaction.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },
        {
          $unwind: {
            path: "$event",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: "$eventId",
            totalTransactions: { $sum: 1 },
            totalTickets: { $sum: { $size: "$ticketId" } },
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            eventId: "$_id",
            totalTransactions: 1,
            totalTickets: 1,
            totalRevenue: 1,
          },
        },
      ]);

      return ResponseAPI.success(
        res,
        summary,
        "Transaction summary retrieved successfully"
      );
    } catch (error) {
      return ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = eventController;
