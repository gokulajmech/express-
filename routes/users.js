var express = require('express');
var router = express.Router();
const {hashing,hashCompare,role,createJWT,authentication}=require('../library/auth');
const {dbUrl,mongodb,MongoClient,dbName}=require('../dbconfig');

/* GET users listing. */
router.get('/', async(req, res)=> {
  res.json({
    message:"users"
  })
});
module.exports = router;
