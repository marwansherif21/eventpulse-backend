const router = require('express').Router();
const { body, param } = require('express-validator');
const registrationsController = require('../controllers/registrations.controller');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');

router.post('/', body('eventId').isMongoId().withMessage('eventId must be a valid MongoId'), validate, requireAuth, registrationsController.registerForEvent);
router.get('/my', requireAuth, registrationsController.getMyRegistrations);
router.delete('/:id', param('id').isMongoId().withMessage('Registration id must be a valid MongoId'), validate, requireAuth, registrationsController.cancelRegistration);

module.exports = router;