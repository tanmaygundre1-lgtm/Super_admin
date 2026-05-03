const express = require('express');
const router = express.Router();
const verifyInternalStaff = require('../src/middleware/verifyInternalStaff');
const { login } = require('../controllers/superAdminAuthController');
const { getAllSchools, getStats, createSchool, updateSchool } = require('../controllers/superAdminSchoolController');
const { getAllStaff, createStaff } = require('../controllers/superAdminStaffController');
const { renewSchoolSubscription, getSchoolRenewals } = require('../controllers/superAdminBillingController');
const { getAnnouncements, createAnnouncement, updateAnnouncement, getSupportTickets, updateTicketStatus } = require('../controllers/superAdminGlobalController');

// Auth (no middleware needed)
router.post('/login', login);

// Protected routes
router.options('/stats', (req, res) => res.sendStatus(204));
router.get('/schools', verifyInternalStaff, getAllSchools);
router.post('/schools', verifyInternalStaff, createSchool);
router.patch('/schools/:id', verifyInternalStaff, updateSchool);
router.get('/stats', verifyInternalStaff, getStats);
router.get('/staff', verifyInternalStaff, getAllStaff);
router.post('/staff', verifyInternalStaff, createStaff);
router.post('/schools/:id/renew', verifyInternalStaff, renewSchoolSubscription);
router.get('/schools/:id/renewals', verifyInternalStaff, getSchoolRenewals);

// Announcement routes
router.get('/announcements', verifyInternalStaff, getAnnouncements);
router.post('/announcements', verifyInternalStaff, createAnnouncement);
router.patch('/announcements/:id', verifyInternalStaff, updateAnnouncement);

// Support ticket routes
router.get('/support-tickets', verifyInternalStaff, getSupportTickets);
router.patch('/support-tickets/:id/status', verifyInternalStaff, updateTicketStatus);

module.exports = router;
