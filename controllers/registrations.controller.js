const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getUserId = (req) => req.user.userId || req.user.id;

exports.registerForEvent = asyncHandler(async (req, res, next) => {
    const eventId = req.body.eventId || req.body.event;
    const attendeeId = getUserId(req);

    if (!eventId) {
        return next(new AppError('Event is required', 400));
    }

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    const existing = await Registration.findOne({ event: eventId, attendee: attendeeId });

    if (existing) {
        return next(new AppError('You are already registered for this event', 400));
    }

    const currentCount = await Registration.countDocuments({ event: eventId });

    if (currentCount >= event.capacity) {
        return next(new AppError('This event is full', 400));
    }

    const registration = await Registration.create({
        event: eventId,
        attendee: attendeeId
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { registrations: 1 } });

    res.status(201).json({ status: 'success', data: registration });
});

exports.getMyRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ attendee: getUserId(req) })
        .populate('event');

    res.status(200).json({ status: 'success', data: registrations });
});

exports.cancelRegistration = asyncHandler(async (req, res, next) => {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
        return next(new AppError('Registration not found', 404));
    }

    if (registration.attendee.toString() !== String(getUserId(req))) {
        return next(new AppError('You can only cancel your own registration', 403));
    }

    await registration.deleteOne();
    await Event.findByIdAndUpdate(registration.event, { $inc: { registrations: -1 } });

    res.status(200).json({
        status: 'success',
        message: 'Registration cancelled successfully'
    });
});