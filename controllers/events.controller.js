const Event = require('../models/event.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const eventFields = ['title', 'description', 'category', 'date', 'city', 'venue', 'capacity'];
const populateEvent = (query) => query
    .populate('category')
    .populate('organizer', 'name email role');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getEvents = asyncHandler(async (req, res) => {
    const {
        category,
        city,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 10,
        sortBy = 'date',
        order = 'asc'
    } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (city) filter.city = city;

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
        filter.$or = [
            { title: { $regex: escapeRegex(search), $options: 'i' } },
            { description: { $regex: escapeRegex(search), $options: 'i' } }
        ];
    }

    const pageNum = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
    const sortField = ['date', 'registrations'].includes(sortBy) ? sortBy : 'date';
    const sortDirection = order === 'desc' ? -1 : 1;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        populateEvent(Event.find(filter).sort({ [sortField]: sortDirection }).skip(skip).limit(limitNum)),
        Event.countDocuments(filter)
    ]);

    res.status(200).json({
        status: 'success',
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data
    });
});

exports.getEventById = asyncHandler(async (req, res, next) => {
    const event = await populateEvent(Event.findById(req.params.id));

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    res.status(200).json({ status: 'success', data: event });
});

exports.createEvent = asyncHandler(async (req, res) => {
    const eventData = {};
    eventFields.forEach((field) => {
        if (req.body[field] !== undefined) eventData[field] = req.body[field];
    });
    eventData.organizer = req.user.userId;

    const event = await Event.create(eventData);
    const populatedEvent = await populateEvent(Event.findById(event._id));

    res.status(201).json({ status: 'success', data: populatedEvent });
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
    const updates = {};
    eventFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const event = await populateEvent(Event.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ));

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    res.status(200).json({ status: 'success', data: event });
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    res.status(204).send();
});