// routes/users.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getAllUsers
} = require('../controllers/users/usersControl'); 

const   {
    authMiddleware
}   =  require('../middlewares/auth/authMiddleware')

// ✅ Register new staff
router.post('/register-user', registerUser);

// ✅ Login
router.post('/login', loginUser);

// ✅ Logout
router.post('/logout',  authMiddleware   ,  logoutUser);

// ✅ Reset password
router.post('/reset-password', resetPassword);

// ✅ Fetch all users (admin-only ideally)
router.get('/users', getAllUsers);

module.exports = router;
