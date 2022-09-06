const router = require('express').Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.get('/me', updateUserProfile);
router.post('/me/avatar', updateUserAvatar);

module.exports = router;
