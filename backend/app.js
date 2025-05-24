const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const requestToSpeakRoutes = require('./routes/requestToSpeak');
const attendanceRoutes = require('./routes/attendance');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/request-to-speak', requestToSpeakRoutes);
app.use('/api/attendance', attendanceRoutes);

module.exports = app; 