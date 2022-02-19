var express = require('express');
var router = express.Router();
const {hashing,hashCompare,role,createJWT,authentication}=require('../library/auth');
const {dbUrl,mongodb,MongoClient,dbName}=require('../dbconfig');

/* GET users listing. */
router.get('/', async(req, res)=> {
  const client= await MongoClient.connect(dbUrl);
  
  try{
    const db=await client.db('b26we');
    let document=await db.collection('auth').find().toArray();

    if(document)
    {
      res.send({
        message:document
      })
    }
    else
    {
     res.send({
       message:"no data available"
     })
    }  
  }
  catch(err){
    res.json({
      message:err
    });
  }
  finally{
    client.close();
  }
  
});

router.post('/register',role,async(req,res)=>{
  const client= await MongoClient.connect(dbUrl);
  
  try{
    const db=await client.db('b26we');
    let document=await db.collection('auth').findOne({email:req.body.email});

    if(document)
    {
      res.send({
        message:"user already exist"
      })
    }
    else
    {
      const hash= await hashing(req.body.password);
      req.body.password=hash;

      let account={
        email:req.body.email,
        password:hash,
        role:req.body.role,
        verification:'N'
      }
     let doc= await db.collection('auth').insertOne(account);
      res.send({
       message: doc
      })
    }  
  }
  catch(err){
    res.json({
      message:err
    });
  }
  finally{
    client.close();
  }
});

router.post('/login',async(req,res)=>{
  const client=await MongoClient.connect(dbUrl);
  try{
    const db=await client.db('b26we');
    let document=await db.collection('auth').findOne({email:req.body.email});

    if(document && document.verification==='Y')
    {
      const compare=await hashCompare(req.body.password,document.password);
      if(compare===true)
      {
        const token = await createJWT({userEmail:req.body.email})
        res.json({
          message:'login successfull',
          token
        })
      }
      else{
        res.json({
          message:"Invalid email/password"
        })
      }
    }
    else{
      const token = await createJWT({userEmail:req.body.email})
      res.json({
        message:"no user exist on this email/user not verified",
        token
      })
    }
   
  }
  catch(err)
  {
    res.json({
      message:err
    })
  }
  finally{
    client.close();
  }
})

router.post('/verify-token/:token',async(req,res)=>{
  const compare= await authentication(req.params.token);
  if(compare.verification===true )
  {
    const client=await MongoClient.connect(dbUrl);
    const db=client.db('b26we');
    const document=db.collection('auth').updateOne({email:compare.email},{$set:{verification:'Y'}})
    

    res.json({
      message:'user verified successfully'
    })
  }  
  else if(compare.verification===true){
    res.json({
      message:'Token expired'
    })
  }
})

router.put('/forgot-password',async(req,res)=>{
  const client=await MongoClient.connect(dbUrl);
  try{
    const db= await client.db('b26we');
    const user= await db.collection('auth').findOne({email:req.body.email});
    if(user)
    {
      let hash = await hashing(req.body.password);
      await db.collection('auth').updateOne({email:req.body.email},{$set:{password:hash}})
      res.json({
        message:"password updated successfully"
      })
    }
    else
    {
      res.json({
        message:"no user exist"
      })
    }
  }
  catch(err)
  {
    res.json(err);
  }
  finally{
    client.close();
  }
})

router.post('/change-password',async(req,res)=>{
  const client=await MongoClient.connect(dbUrl);
  try{
    let db=await client.db('b26we');
    let user=await db.collection('auth').findOne({email:req.body.email});
    if(user)
    {
      const compare=await hashCompare(req.body.password,user.password);
      if(compare===true)
      {
        let hash = await hashing(req.body.newPassword);
        await db.collection('auth').updateOne({email:req.body.email},{$set:{password:hash}})
        res.json({
          message:"password updated successfully"
        })
      }
      else{
        res.json({
          message:"wrong password"
        })
      }
    }
    else{
      res.json({
        message:"Invalid user credentials"
      })
    }
  }
  catch(err)
  {
    res.json(err);
  }
  finally{
    client.close();
  }
})

module.exports = router;
