const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
const secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'secret-key';

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new UnauthorizedError('401 - Необходима авторизация');
  }

  let payload;
  try {
    payload = jwt.verify(token, secretKey);
  } catch (err) {
    throw new UnauthorizedError('401 - Необходима авторизация');
  }

  req.user = payload;
  next();
};
