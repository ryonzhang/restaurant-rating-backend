const {getCollection} = require('./mongo');
const {ObjectID} = require('mongodb');


async function insertReply(reply) {
  const collection = await getCollection();
  return await collection.update(
    { 'reviews._id': new ObjectID(reply.review_id)},
    {
      $set: {
        'reviews.$.reply'
          :{...reply,_id:new ObjectID()},
      },
    },
  );
}

async function getReplies() {
  const collection = await getCollection();
  return collection.find({}).toArray();
}

async function deleteReply(id) {
  const collection = await getCollection();
  return await collection.update(
    { 'reviews._id': new ObjectID(id)},
    {
      $unset: {
        'reviews.$.reply'
          :'',
      },
    },
  );
}

async function updateReply(id, reply) {
  const collection = await getCollection();
  return await collection.update(
    { 'reviews._id': new ObjectID(id)},
    {
      $set: {
        'reviews.$.reply'
          :{...reply,_id:new ObjectID()},
      },
    },
  );
}

module.exports = {
  insertReply,
  getReplies,
  deleteReply,
  updateReply,
};
