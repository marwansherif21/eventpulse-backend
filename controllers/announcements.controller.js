const Event = require('../models/event.model');
const Message = require('../models/message.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getUserId = (req) => req.user.userId || req.user.id;

exports.createAnnouncement = asyncHandler(async (req, res, next) => {
    const { eventId, text } = req.body;

    if (!eventId || typeof text !== 'string' || !text.trim()) {
        return next(new AppError('eventId and text are required', 400));
    }

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    const message = await Message.create({
        event: eventId,
        sender: getUserId(req),
        text: text.trim()
    });
    const savedMessage = await Message.findById(message._id)
        .populate('sender', 'name email role');
    const io = req.app.get('io');

    if (io) {
        io.to(String(eventId)).emit('announcement', savedMessage);
    }

    res.status(201).json({ status: 'success', data: savedMessage });
});

exports.getAnnouncements = asyncHandler(async (req, res) => {
    const messages = await Message.find({ event: req.params.eventId })
        .sort({ createdAt: 1 })
        .populate('sender', 'name email role');

    res.status(200).json({ status: 'success', data: messages });
});