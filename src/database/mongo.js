const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoClient} = require('mongodb');

let database = null;

async function startDatabase() {
  const mongo = new MongoMemoryServer();
  const mongoDBURL = await mongo.getConnectionString();
  const connection = await MongoClient.connect(mongoDBURL, {useNewUrlParser: true});
  database = connection.db();
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

async function getCollection(){
  return database.collection('restaurant');
}

module.exports = {
  getCollection,
  getDatabase,
  startDatabase,
};
