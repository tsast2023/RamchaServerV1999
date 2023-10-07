const users = require('../models/User.model')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')
const socket = require("../socket")
const nodemailer = require("nodemailer");

class APIfeatures {
    constructor(query , queryString){
        this.query = query ; 
        this.queryString = queryString
    }
    filtering() {
        const queryObj = {...this.queryString}
        const excludedFields = ['page' , 'sort' , 'limit']
        excludedFields.forEach(el => delete(queryObj[el]))
        let queryStr = JSON.stringify(queryObj)
        queryStr = quertStr.replace(/\b(gte|gt|lt|lte|regex)\b/g , match => '$' + match )
        this.query.find(JSON.parse(queryStr))
        return this ; 
    }
    sorting() {
        if (this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
         
        }
        else {
            this.query = this.query('-createdAt')
        }
        return this ; 
    }
    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.query.limit * 1 || 6
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this ; 

    }
}
const userCtrl ={
register : async (req , res)=>{
  try {
    const {nom , email , password ,ville,region ,role,numtel, service } = req.body;
    const user = await  users.findOne({email})
    if(user) 
      return res.status(400).json({msg:'the email already exists.'})
    
    //password encryption
     const passwordHash = await bcrypt.hash(password , 10)
     const newUser=new users ({
        nom , email , password :passwordHash, ville, region,role ,numtel, service
     })
     await newUser.save()

     // create jsonwebtoken to authentication
     const accesstoken = createAccessToken({user : {id:newUser._id , role: newUser.role}})
     const refreshtoken = createRefreshToken({user : {id:newUser._id , role: newUser.role}})
     res.cookie('refreshtoken' ,  refreshtoken, {
        httpOnly : true , 
        path :'/api/user/refresh_token',
        maxAge: 7*24*60*60*1000
     })
     res.json({accesstoken})
    
    //  res.json({msg : 'Register Success'})
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({msg : error.message})
    
  }
        
},
login : async (req , res) =>{
    try {
        const {email , password} = req.body;
        const user = await users.findOne({email})
        if(!user) return res.status(400).json({msg :'user does not exist.'})

        const isMatch = await bcrypt.compare(password , user.password)
        if(!isMatch) return  res.status(400).json({msg :'Incorrect password'})

        // if login success , create access token and refresh token 
        const accesstoken = createAccessToken({user : {id: user._id , role: user.role}})
        const refreshtoken = createRefreshToken({user : {id: user._id , role: user.role}})
        res.cookie('refreshtoken' ,  accesstoken, {
           httpOnly : true , 
           path :'/api/user/refresh_token',
           maxAge: 7*24*60*60*1000
        });
        socket.sendOrder(user._id);

        res.json({accesstoken});
        // console.log(accesstoken)
        
    } catch (error) {
        return res.status(500).json({msg : error.message}) 
    }
},   
          logout : async (req, res) => {
    try {
        res.clearCookie('refreshtoken' , { path :'/api/user/refresh_token'})
        return res.json({msg :'Logged out'})
        
    } catch (error) {
    return res.status(500).json({msg : error.message})  
    }

},
refreshToken :(req , res) => {
    try {
        const rf_token = req.cookies.refreshtoken;
        if(!rf_token) return res.status(400).json({msg : 'Please Login or Register'})

        jwt.verify(rf_token , process.env.REFRESH_TOKEN_SECRET ,(error , user) => {

            if(error) return res.status(400).json({msg : 'Please Login or Register'})

            const accessToken = createAccessToken({user : {id: user._id , role: user.role}})

            res.json({accessToken})
            
        })


       // res.json({rf_token})
        
    } catch (error) {
        return res.status(500).json({msg : error.message}) 
    }


},
getUser : async(req , res) => {
    try {
        console.log("user:" , req.user)
        const user = await users.findById(req.user.user.id).select('-password')
        console.log("user:" , req.user)
        if(!user) return res.status(400).json({msg :"user does not exist."}) 
        res.json(user)
    } catch (error) {
        console.log(error) 
        return res.status(500).json({msg : error.message}) 

    }
},
getAllUsers : async(req , res) => {
    try {
        const features = new APIfeatures(users.find(), req.query).filtering().sorting().paginating();
        const allUsers = await features.query;
    res.json(allUsers)
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
},
getAll : async(req , res) => {
    try {
        const allUsers = await users.find();
    res.json(allUsers)
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
},
UpdateUser : async(req,res) =>{
    try {
        console.log("body of aziz", req.body)
        console.log("id of aziz",req.params.id)
        const {nom , email , password  , numtel,ville , region , img } = req.body;
        const userrr =  await users.findOneAndUpdate(({_id : req.params.id},{nom , email , numtel ,password , ville , region , img }))
        res.json(userrr) 
        
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message : error.message}) 
    }
},
deleteUsers : async(req,res)=>{
    try {
        await users.findByIdAndDelete(req.params.id)
        res.json({msg : "deleted user"})
        
    } catch (error) {
        return res.status(500).json({message : error.message})   
    }

},
deleteUser : async(req,res)=>{
    try {
        await users.findByIdAndDelete(req.params.id)
        res.json({msg : "deleted user"})
        
    } catch (error) {
        return res.status(500).json({message : error.message})   
    }

},
verifyMail : async(req,res)=>{
    try{
        const userV = await users.findOne({email : req.body.email});
        if(userV){
            res.json('user exist')
        }else{
            res.status(404).json('user doesn"t exist')
        }
    }catch(err){
        res.status(500).json(err)
    }

},
updatePassword: async(req,res)=>{
    try{
        const passwordHash = await bcrypt.hash(req.body.password , 10)
        console.log(passwordHash)
        let doc = await users.findOneAndUpdate({email:req.query.email}, {password : passwordHash}); 
        res.json(doc)
    }catch(err){
        res.json(err)
    }

},
sendLocation : async(req,res)=>{
    try{
        const updateLocation = await users.updateOne({_id : req.body.id} , {location : req.body.location})
        res.json(updateLocation)
       

    }catch(err){
        res.status(500).json(err)
    }
},
getCount : async (req,res)=>{
    try{
        const Userss = await users.find();
        res.json(Userss.length)
      }catch(err){
      res.json(err)
      }
}

}
const createAccessToken= (user) => {
    return jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {expiresIn : '365d'})
}
const  createRefreshToken= (user) => {
    return jwt.sign(user , process.env.REFRESH_TOKEN_SECRET , {expiresIn : '7d'})
}


module.exports = userCtrl