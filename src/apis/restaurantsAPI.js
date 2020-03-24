const express = require('express');
const {checkAccessToken, checkPermission} = require('../authorizationUtils');
const { check, validationResult } = require('express-validator');

const {insertRestaurant, getRestaurants,updateRestaurant,deleteRestaurant} = require('../database/restaurants');

const router = express.Router();

router.use(checkAccessToken(process.env.ISSUER, process.env.TOPTAL_API));

// endpoint to return all restaurants
router.get('/', checkPermission('view:restaurants'),
  async (req, res) => {
  res.send(await getRestaurants());
});

// endpoint to insert new restaurant
router.post('/', checkPermission('create:restaurants'),
  [check('name').notEmpty().isString(),check('owner_id').isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  const newRestaurant = req.body;
  const result=await insertRestaurant(newRestaurant);
  res.send(result);
});

// endpoint to update restaurant
router.put('/:id', checkPermission('edit:restaurants'),
  async (req, res) => {
  const newRestaurant = req.body;
  await updateRestaurant(req.params.id,newRestaurant);
  res.send({ message: 'Restaurant updated.' });
});

// endpoint to delete restaurant
router.delete('/:id', checkPermission('delete:restaurants'),
  async (req, res) => {
  const result = await deleteRestaurant(req.params.id);
  res.send(result);
});

module.exports = router;
