const router = require('express').Router();
const { body, param } = require('express-validator');
const eventsController = require('../controllers/events.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

const createEventValidation = [
	body('title').trim().notEmpty().withMessage('Title is required'),
	body('description').trim().notEmpty().withMessage('Description is required'),
	body('category').isMongoId().withMessage('Category must be a valid MongoId'),
	body('date').isISO8601().withMessage('Date must be valid'),
	body('city').trim().notEmpty().withMessage('City is required'),
	body('venue').trim().notEmpty().withMessage('Venue is required'),
	body('capacity').isFloat({ gt: 0 }).withMessage('Capacity must be a positive number'),
	validate
];

const updateEventValidation = [
	param('id').isMongoId().withMessage('Event id must be a valid MongoId'),
	body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
	body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
	body('category').optional().isMongoId().withMessage('Category must be a valid MongoId'),
	body('date').optional().isISO8601().withMessage('Date must be valid'),
	body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
	body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
	body('capacity').optional().isFloat({ gt: 0 }).withMessage('Capacity must be a positive number'),
	validate
];

const idValidation = [param('id').isMongoId().withMessage('Event id must be a valid MongoId'), validate];

router.get('/', eventsController.getEvents);
router.get('/:id', idValidation, eventsController.getEventById);
router.post('/', createEventValidation, requireAuth, requireRole('admin'), eventsController.createEvent);
router.patch('/:id', updateEventValidation, requireAuth, requireRole('admin'), eventsController.updateEvent);
router.delete('/:id', idValidation, requireAuth, requireRole('admin'), eventsController.deleteEvent);

module.exports = router;