const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/unauthorizedError');
const { patternUrl } = require('../constants/constants');
// Удалено минимальное значение для валидации пароля

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, 'Имя должно быть длиннее 2х символов, сейчас его длина {VALUE} символ(ов)'],
      maxlength: [30, 'Имя должно быть короче 30ти символов, сейчас его длина {VALUE} символ(ов)'],
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: [2, 'Описание должно быть длиннее 2х символов, сейчас его длина {VALUE} символ(ов)'],
      maxlength: [30, 'Описание должно быть короче 30ти символов, сейчас его длина {VALUE} символ(ов)'],
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      validate: {
        validator(url) {
          return patternUrl.test(url);
        },
        message: 'Некорректный url',
      },
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator(email) {
          return validator.isEmail(email);
        },
        message: 'Неправильный формат почты',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('401 - Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('401 - Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
