const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
dbName='b26we'
const dbUrl = `mongodb+srv://gokulrajan:admin@cluster0.qhtpc.mongodb.net/test`;
module.exports={dbUrl,mongodb,MongoClient,dbName}