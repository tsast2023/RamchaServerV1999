const Avis = require('../models/Avis.model')
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
const avisCtrl ={
add : async (req , res)=>{
    
    try{
        const {nomUser , description , date , nomWorker  , nbrating }=req.body
        const newavis=new Avis ({nomUser , description , date , nomWorker  , nbrating })
       await newavis.save();
       res.json({newavis})
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
 

},

getavis : async (req , res) =>{
    try{
        const avisF = await Avis.find({_id : req.params.id});
        res.json({avisF})
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
},  
delete : async (req, res) => {
    try{
        await  Avis.findOneAndDelete({_id : req.params.id});
        res.send("avis deleted !!")
    
    }catch(err){
        return res.status(500).json({message : err.message}) 
    }
   
}, 

getAll : async (req, res) => {
    const features = new APIfeatures(Avis.find(), req.query).filtering().sorting().paginating();
    const allAvis = await features.query;
    res.json(allAvis)

},
getAllAvis : async (req, res) => {
    const allAvis = await Avis.find();
    res.json(allAvis)

},
getCount : async (req,res)=>{
    try{
        const avisss = await Avis.find();
        res.json(avisss.length)
      }catch(err){
      res.json(err)
      }
}

}



module.exports = avisCtrl