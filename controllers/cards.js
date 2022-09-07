const Card = require('../models/card');
const { ERROR_CODE_CAST, ERROR_CODE_NOT_FOUND, ERROR_CODE_DEFAULT } = require('../errors/errors');

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(ERROR_CODE_DEFAULT).send(`На сервере произошла ошибка: ${{ message: err.message }}`));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Переданы некорректные данные при создании карточки' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(`На сервере произошла ошибка: ${{ message: err.message }}`);
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const CardNotFound = new Error(`404 - Карточка с указанным _id:${req.params.cardId} не найдена`);
      CardNotFound.name = 'CardNotFound';
      return CardNotFound;
    })
    .then(() => res.send({ message: 'Карточка успешно удалена' }))
    .catch((err) => {
      if (err.name === 'CardNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_CAST).send({ message: 'Некорректный _id карточки' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(`На сервере произошла ошибка: ${{ message: err.message }}`);
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const CardNotFound = new Error(`400 - Передан несуществующий _id:${req.params.cardId} карточки`);
      CardNotFound.name = 'CardNotFound';
      return CardNotFound;
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CardNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_CAST).send({ message: '400 - Переданы некорректные данные для постановки лайка' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(`На сервере произошла ошибка: ${{ message: err.message }}`);
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const CardNotFound = new Error(`400 - Передан несуществующий _id:${req.params.cardId} карточки`);
      CardNotFound.name = 'CardNotFound';
      return CardNotFound;
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CardNotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_CAST).send({ message: '404 - Переданы некорректные данные для снятия лайка' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send(`На сервере произошла ошибка: ${{ message: err.message }}`);
    });
};
