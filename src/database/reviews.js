const {getCollection} = require('./mongo');
const {ObjectID} = require('mongodb');


const {getRestaurant,insertRestaurant, getRestaurants,updateRestaurant,deleteRestaurant} = require('../database/restaurants');


async function insertReview(review) {
  review._id= new ObjectID();
  const restaurant = await getRestaurant(review.restaurant_id);
  await updateRestaurant(review.restaurant_id,{reviews:[...restaurant.reviews||[],review]});
  await updateAggregate(review.restaurant_id);
  return await getRestaurant(review.restaurant_id);
}


async function getReviews() {
  const collection = await getCollection();
  return await collection.find({}).toArray();
}

async function deleteReview(id) {
  const collection = await getCollection();
  return await collection.update(
    {},
    {$pull: {reviews:{_id:new ObjectID(id)}}},
    {multi:true}
  );
}

async function updateReview(id, review) {
  const collection = await getCollection();
  return await collection.update(
    { 'reviews._id': new ObjectID(id)},
    {
      $set: {
        'reviews.$'
        :{...review,_id:new ObjectID(id)},
      },
    },
  );
}

async function updateAggregate(restaurant_id){
  const collection = await getCollection();
  const result = await collection.aggregate([
    {$addFields:{
      avg_rating:{$avg:'$reviews.rating'},
    }},
    { $out : "restaurant" }
  ]).toArray();
  console.log(result);
}

module.exports = {
  insertReview,
  getReviews,
  deleteReview,
  updateReview,
};
