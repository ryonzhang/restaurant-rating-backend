const {getCollection} = require('./mongo');
const {ObjectID} = require('mongodb');


async function insertRestaurant(restaurant) {
  const collection = await getCollection();
  const {insertedId} = await collection.insertOne(restaurant);
  return getRestaurant(insertedId);
}

async function getRestaurants() {
  const collection = await getCollection();
  return await collection.find({}).toArray();
}

async function getRestaurant(id) {
  const collection = await getCollection();
  const restaurants= await collection.find({'_id': new ObjectID(id)}).toArray();
  if(restaurants.length>0){
    return restaurants[0];
  }
}

async function deleteRestaurant(id) {
  const collection = await getCollection();
  return await collection.deleteOne({
    _id: new ObjectID(id),
  });
}

async function updateRestaurant(id, restaurant) {
  const collection = await getCollection();
  delete restaurant._id;
  await collection.update(
    { _id: new ObjectID(id), },
    {
      $set: {
        ...restaurant,
      },
    },
  );
}

module.exports = {
  getRestaurant,
  insertRestaurant,
  getRestaurants,
  deleteRestaurant,
  updateRestaurant,
};
