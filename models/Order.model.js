const mongoose = require  ("mongoose");
const orderSchema = new mongoose.Schema({

    nomService: {type: String  },
    description : {type : String },
    status : {type : String},
    date: {type: String },
    images: 
        {
          type: [String],
        }
      ,
       location: {
          type: String,
          
        },
     
    user: {type: mongoose.Schema.Types.ObjectId,},
    workers: [
      {
        name: String,
        workerid: String,
        price: String
      }
    ]
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("order", orderSchema);


