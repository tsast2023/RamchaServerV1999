const mongoose = require  ("mongoose");
const AvisSchema = new mongoose.Schema({

    nomUser: {type: String , required: true},
    nomWorker:{type:String , required:true},
    description : {type : String, required: true},
    nbrating : {type : Number , required : false}
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Avis", AvisSchema);


