const express = require('express');
const router = express.Router();
const requestToSpeakController = require('../controllers/requestToSpeakController');

router.post('/request', requestToSpeakController.request);

module.exports = router; 