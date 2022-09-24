const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.cookies.jwt;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('401 - Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    throw new UnauthorizedError('401 - Необходима авторизация');
  }

  req.user = payload;
  next();
};
