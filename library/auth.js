const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const jwtd=require("jwt-decode");
const secret="123ajekfieorfiew233ksdfsdjfekf";
const hashing=async(value)=>{
    try{
        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(value,salt);
        return hash;
    }
    catch(err)
    {
        return err;
    }
}

const hashCompare=async(Password,hashValue)=>{
    try{
        return await bcrypt.compare(Password,hashValue);
    }
    catch(err){
        return err;
    }
}

const role=async(req,res,next)=>{
    switch(req.body.role)
    {
        case 1:
            console.log('admin');
            next();
            break;
        case 2:
            console.log('student');
            next();
            break;
        default:
            res.json({
                message:"Invalid role"
            })
    }
}

const createJWT= async({userEmail})=>{
    //1m=1 minute, 1hr=1 hourr
   return await jwt.sign({userEmail},secret,{expiresIn:"1m"});
}

const authentication = async(token)=>{
    const decode=await jwtd(token);
    console.log(decode);
    if((Math.round(new Date()/1000)) <= decode.exp)
    return {verification:true,email:decode.userEmail}
    else
    return {verification:false,email:decode.userEmail}
    
}
module.exports={hashing,hashCompare,role,createJWT,authentication};