const mongoose = require('mongoose');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/bpmn';

async function connect() {
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function insert(collection, doc) {
  const Model = mongoose.model(collection, new mongoose.Schema({}, { strict: false }));
  return Model.create(doc);
}

async function saveHistory(collection, doc) {
  const Model = mongoose.model(collection, new mongoose.Schema({}, { strict: false }));
  return Model.create(doc);
}

module.exports = { connect, insert, saveHistory };
