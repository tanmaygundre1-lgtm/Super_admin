const express = require('express');
const router = express.Router();
const verifyInternalStaff = require('../src/middleware/verifyInternalStaff');
const { login } = require('../controllers/superAdminAuthController');
const { getAllSchools, createSchool, updateSchool } = require('../controllers/superAdminSchoolController');

// Auth (no middleware needed)
router.post('/login', login);

// Protected routes
router.get('/schools', verifyInternalStaff, getAllSchools);
router.post('/schools', verifyInternalStaff, createSchool);
router.patch('/schools/:id', verifyInternalStaff, updateSchool);

module.exports = router;
