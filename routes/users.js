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
router.patch('/me', updateUserProfile);
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
