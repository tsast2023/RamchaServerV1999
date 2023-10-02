const services = require('../models/Service.model')
class APIfeatures {
    constructor(query , queryString){
        this.query = query ; 
        this.queryString = queryString
    }
    filtering() {
        const queryObj = {...this.queryString}
        const excludedFields = ['page' , 'sort' , 'limit']
        excludedFields.forEach(el => delete(queryObj[el]))
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g , match => '$' + match )
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
const serviceCtrl ={
add : async (req , res)=>{
  const {nom , description , img }=req.body
  const newService=new services ({
    nom , description , img
 })
 await newService.save()
 res.json({newService})

},

getService : async (req , res) =>{
    try{
        const ServiceF = await services.find({_id : req.params.id});
        res.json({ServiceF})
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
},  
delete : async (req, res) => {
    try{
        const allServices = await services.findOneAndDelete({_id : req.params.id});
        res.send("service deleted !!")
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
   
}, 
update : async (req, res) => {
    try{
        const {nom , description , img } = req.body;
        const serviceU = await services.findOneAndUpdate({_id : req.params.id} ,{nom , description , img} );
        res.json({serviceU})
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
    

}, 
getAllServices : async (req, res) => {
    const features = new APIfeatures(services.find(), req.query).filtering().sorting().paginating();
    const allServices = await features.query;
    res.json(allServices)

},
getAll : async (req,res) =>{
    const allServices = await services.find();
    res.json(allServices);
}


}



module.exports = serviceCtrl