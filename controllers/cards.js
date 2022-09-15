const Card = require('../models/card');

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('400 - Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с указанным _id ${req.params.cardId} не найдена`);
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Вы не можете удалить чужую карточку');
      }

      return card.remove();
    })
    .then(() => res.send({ message: 'Карточка успешно удалена' }))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(
      () => next(new NotFoundError(`404 - Передан несуществующий _id:${req.params.cardId} карточки`)),
    )
    .then((card) => res.send(card))
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(
      () => next(new NotFoundError(`404 - Передан несуществующий _id:${req.params.cardId} карточки`)),
    )
    .then((card) => res.send(card))
    .catch(next);
};
