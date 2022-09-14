const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  ERROR_CODE_CAST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_DEFAULT,
  textErrorDefault,
} = require('../errors/errors');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(textErrorDefault));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const UserNotFound = new Error(`404 - Пользователь по указанному _id: ${req.params.userId} не найден`);
      UserNotFound.name = 'UserNotFound';
      return UserNotFound;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'UserNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Некорректный _id пользователя' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(textErrorDefault);
    });
};

module.exports.getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail(() => {
      const UserNotFound = new Error(`404 - Пользователь по указанному _id: ${req.user._id} не найден`);
      UserNotFound.name = 'UserNotFound';
      return UserNotFound;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'UserNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Некорректный _id пользователя' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(textErrorDefault);
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => {
          res.send(
            {
              _id: user._id,
              name: user.name,
              about: user.about,
              avatar: user.avatar,
              email: user.email,
            },
          );
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            res.status(ERROR_CODE_CAST).send({ message: '400 - Переданы некорректные данные при создании пользователя' });
            return;
          }
          res.status(ERROR_CODE_DEFAULT).send(textErrorDefault);
        });
    });
};

module.exports.updateUserProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      const UserNotFound = new Error(`404 - Пользователь с указанным _id: ${req.user._id} не найден`);
      UserNotFound.name = 'UserNotFound';
      return UserNotFound;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Переданы некорректные данные при обновлении профиля' });
        return;
      }
      if (err.name === 'UserNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(textErrorDefault);
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      const UserNotFound = new Error(`404 - Пользователь по указанному _id: ${req.user._id} не найден`);
      UserNotFound.name = 'UserNotFound';
      return UserNotFound;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Переданы некорректные данные при обновлении аватара' });
        return;
      }
      if (err.name === 'UserNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(textErrorDefault);
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true }).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
