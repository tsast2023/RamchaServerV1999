const mongoose = require  ("mongoose");
const ServiceSchema = new mongoose.Schema({

    nom: {type: String , required: true},
    description : {type : String, required: true},
    img: {type: String, required: true},
    icon: {type: String}
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Service", ServiceSchema);


