const express = require('express');
const router = express.Router();
const   {registerVisitor}  =  require('../controllers/visitors/visitorsControl')

// Register the route
router.post('/visitors/register-visitor', registerVisitor);
module.exports  =  router;
