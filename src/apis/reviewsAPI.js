const express = require('express');
const {checkAccessToken, checkPermission} = require('../authorizationUtils');
const { check, validationResult } = require('express-validator');
const {insertReview, getReviews,updateReview,deleteReview} = require('../database/reviews');

const router = express.Router();

router.use(checkAccessToken(process.env.ISSUER, process.env.EXPENSE_API));

// endpoint to return all reviews
router.get('/', checkPermission('view:reviews'),
async (req, res) => {
  res.send(await getReviews());
});

function isValidDate(value) {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;

  const date = new Date(value);
  if (!date.getTime()) return false;
  return date.toISOString().slice(0, 10) === value;
}

// endpoint to insert new review
router.post('/:id', checkPermission('create:reviews'),
  [check('rating').notEmpty().isNumeric(),check('date_of_visit').custom(isValidDate).withMessage('the date must be valid').notEmpty(),check('comment').isString().notEmpty()],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const newReview = req.body;
  newReview.restaurant_id=req.params.id;
  const result = await insertReview(newReview);
  res.send(result);
});

// endpoint to update review
router.put('/:id', checkPermission('edit:reviews'),
  async (req, res) => {
  const newReview = req.body;
  const result =await updateReview(req.params.id,newReview);
  res.send(result);
});

// endpoint to delete review
router.delete('/:id', checkPermission('delete:reviews'),
  async (req, res) => {
  const result = await deleteReview(req.params.id);
  res.send(result);
});

module.exports = router;
