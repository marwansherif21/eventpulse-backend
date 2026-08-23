require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Category = require('./models/category.model');
const Event = require('./models/event.model');
const Message = require('./models/message.model');
const Registration = require('./models/registration.model');
const User = require('./models/user.model');

const seed = async () => {
    await connectDB();

    await Message.deleteMany({});
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    const admin = await User.create({
        name: 'EventPulse Admin',
        email: 'admin@eventpulse.com',
        password: await bcrypt.hash('Admin123!', 12),
        role: 'admin'
    });

    const categories = await Category.insertMany([
        { name: 'Tech', description: 'Conferences, workshops, and meetups for technology professionals.' },
        { name: 'Music', description: 'Live performances and music-focused community events.' },
        { name: 'Sports', description: 'Competitions, training sessions, and sporting community events.' }
    ]);

    await Event.insertMany([
        {
            title: 'Future of Web Development',
            description: 'A practical conference covering the tools shaping modern web applications.',
            category: categories[0]._id,
            date: new Date('2026-09-15T09:00:00Z'),
            city: 'New York', venue: 'Hudson Hall', capacity: 300, organizer: admin._id
        },
        {
            title: 'Open Source Builders Meetup',
            description: 'Connect with maintainers and contributors building the next generation of software.',
            category: categories[0]._id,
            date: new Date('2026-10-03T18:00:00Z'),
            city: 'Austin', venue: 'Capital Factory', capacity: 120, organizer: admin._id
        },
        {
            title: 'Rooftop Jazz Evening',
            description: 'An intimate evening of live jazz from local and visiting artists.',
            category: categories[1]._id,
            date: new Date('2026-09-26T19:30:00Z'),
            city: 'Chicago', venue: 'Skyline Terrace', capacity: 180, organizer: admin._id
        },
        {
            title: 'Startup Leaders Forum',
            description: 'A day of candid talks and structured networking for ambitious founders.',
            category: categories[2]._id,
            date: new Date('2026-11-07T10:00:00Z'),
            city: 'San Francisco', venue: 'Pier 27', capacity: 250, organizer: admin._id
        }
    ]);

    console.log('Database seeded successfully');
};

seed()
    .catch((error) => {
        console.error('Seeding failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });