const order = require('../models/Order.model')
const fs = require('fs');
const mongoose = require('mongoose')
const globalMap = require('../globalMap');
const {sendMessage} =require("../socket")
const users = require('../models/User.model')
const {getNearestWorkers} = require("../Functions")
const {getIo} = require('../socket');
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
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match);
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
const orderCtrl ={
add : async (req , res)=>{
    
    try{
        const {nomService , description ,  location  , images  }=req.body;
        const user= req.params.id;

        const keyIterator = globalMap.keys();
        const keysArray = Array.from(keyIterator);
        console.log("connected users:" , keysArray);
        const workers = await users.find({role:"Worker" , _id :{ $in: keysArray , $ne: user} ,service :nomService });
        
        console.log("workers" , workers)
        const workersIdlist = [];
        const socketIdsList = []

      getNearestWorkers(workers, location)
      .then(result => {
      console.log("result:" , result);
      result.forEach(item => {
        workersIdlist.push(item);
        
        });

    console.log("workersIdlist" , workersIdlist)
    const newOrder=new order ({nomService  , description , location , images , user , workers: workersIdlist.map(workerid => ({ workerid })) , status: "created" });
     newOrder.save()
    workersIdlist.forEach(userid => {
        console.log("userid:" ,userid)
        if (globalMap.get(userid)) {

            console.log('is there')
          // If userid exists in the mapping, add its socketids to socketIdsList
          socketIdsList.push(...globalMap.get(userid));
        }
      });
      console.log('liste des socketids' , socketIdsList)
    
      
      const event = "new order"
      sendMessage(socketIdsList , newOrder ,event )
        if(socketIdsList){
            res.json({workers})
        }else{
            res.send('workers not available')
        }
        console.log('hello from the bottom:',workersIdlist)
        

      }).catch(error => {
    console.error(error);
    });
    

    }catch(err){
        return res.status(500).json({message : err.message}) 
}


},

sendPrice: async(req,res)=>{
    try{
        const workerrs = await users.find({_id : req.body.workerId})
        
        const orderwithPrice = await  order.findOneAndUpdate({ _id: req.body.orderId , "workers.workerid": req.body.workerId },{ $set:{"workers.$.name" : workerrs.name , "workers.$.price": req.body.price}  }).lean();
        console.log(orderwithPrice)
        
        const socketId = globalMap.get(orderwithPrice.user.toString());
        console.log(globalMap)
        console.log("socketid:",socketId)
        const event = "send price"
        sendMessage(socketId ,orderwithPrice , event  )
        res.json('updated!!')
    }catch(err){
        res.json(err)
    }

},
selectWorker: async (req,res)=>{
    try{
    const updatedOrder = await order.findOne({_id: req.body.orderId});
    console.log(updatedOrder)
    console.log(req.body)
    updatedOrder.workers = updatedOrder.workers.filter(obj => obj.workerid === req.body.workerId);
    updatedOrder.status = "en cours";
    updatedOrder.save();

    const socketId = globalMap.get(req.body.workerId);
    console.log("socketid:", socketId)
    const event = "select worker"
    sendMessage(socketId ,updatedOrder , event  )
    res.json(updatedOrder)
    }catch(err){
        res.json(err)
    }

},

confirmFromWorker : async(req,res)=>{
    try{
        const orderLast  = await order.findOne({_id: req.body.orderId});
        const socketId = globalMap.get(orderLast.user.toString());
            console.log("socketid:", socketId)
            const event = "confirm from worker"
            sendMessage(socketId ,orderLast , event  )
            res.json({msg: "order confirmed"})
    }catch(err){
        res.json(err)
        console.log(err)
    }

},

getorder : async (req , res) =>{
    try{
        const orderF = await order.findOne({_id : req.params.id});
        res.json(orderF)
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
},  
delete : async (req, res) => {
    try{
        const allorder = await order.findOneAndDelete({_id : req.params.id});
        res.send("order deleted !!")
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
   
}, 
update : async (req, res) => {
    try{
        const {nom , service  , location ,   } = req.body;
        const orderU = await order.findOneAndUpdate({_id : req.params.id} ,{nom , service  , location } );
        res.json({orderU})
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
    

}, 
getAllOrders : async (req, res) => {
    const features = new APIfeatures(order.find(), req.query).filtering().sorting().paginating();
    const allorder = await features.query;
    res.json(allorder)

},
getAll : async (req, res) => {
    try{
        const allOrders = await order.find({});
        console.log(allOrders)
        res.json(allOrders);
    }catch(err){
        console.log(err)
        res.json(err);
    }
   
},
getAllbyuser : async (req, res) => {
    try{
        console.log("user:", req.query.user)
        const allOrders = await order.find({user: req.query.user});
        res.json(allOrders);
    }catch(err){
        console.error(err);
        res.json(err)
    }
    
},
getAllbyworker : async (req,res) =>{
    try{
      const ordeers = await order.find({'workers.workerid': req.params.id})
      res.json(ordeers)
    }catch(err){
    res.json(err)
    }
},
getCount : async (req,res)=>{
    try{
        const ordeers = await order.find();
        res.json(ordeers.length)
      }catch(err){
      res.json(err)
      }
}

}



module.exports = orderCtrl





