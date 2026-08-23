require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const eventsRoutes = require('./routes/events.routes');
const registrationsRoutes = require('./routes/registrations.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
	['body', 'params', 'headers', 'query'].forEach((key) => {
		if (req[key]) mongoSanitize.sanitize(req[key]);
	});
	next();
});

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		environment: process.env.NODE_ENV || 'development',
		uptime: process.uptime(),
		database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
	});
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (process.env.VERCEL) {
	app.use(async (req, res, next) => {
		try {
			await connectDB();
			next();
		} catch (error) {
			next(error);
		}
	});
}

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/announcements', announcementsRoutes);

app.use((req, res) => {
	res.status(404).json({ status: 'fail', message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
