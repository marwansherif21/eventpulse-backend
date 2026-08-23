const router = require('express').Router();
const { body, param } = require('express-validator');
const announcementsController = require('../controllers/announcements.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

router.get('/:eventId', param('eventId').isMongoId().withMessage('Event id must be a valid MongoId'), validate, announcementsController.getAnnouncements);
router.post(
	'/',
	body('eventId').isMongoId().withMessage('Event id must be a valid MongoId'),
	body('text').isString().trim().notEmpty().withMessage('Announcement text is required'),
	validate,
	requireAuth,
	requireRole('admin'),
	announcementsController.createAnnouncement
);

module.exports = router;