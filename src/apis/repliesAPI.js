const express = require('express');
const {checkAccessToken, checkPermission} = require('../authorizationUtils');
const { check, validationResult } = require('express-validator');
const {insertReply, getReplies,updateReply,deleteReply} = require('../database/replies');
const {updateReview} =require('../database/reviews');

const router = express.Router();

router.use(checkAccessToken(process.env.ISSUER, process.env.EXPENSE_API));

// endpoint to return all replies
router.get('/', checkPermission('view:replies'),
async (req, res) => {
  res.send(await getReplies());
});

// endpoint to insert new reply
router.post('/:id',checkPermission('create:replies'),
  [check('comment').isString().notEmpty()],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const result = await insertReply({...req.body,review_id:req.params.id});
  res.send(result);
});

// endpoint to update reply
router.put('/:review_id', checkPermission('edit:replies'),
 async (req, res) => {
  const newReply = req.body;
  await updateReply(req.params.review_id,newReply);
  res.send({ message: 'Reply updated.' });
});

// endpoint to delete reply
router.delete('/:review_id', checkPermission('delete:replies'),
 async (req, res) => {
  await deleteReply(req.params.review_id);
  res.send({ message: 'Reply deleted.' });
});

module.exports = router;
