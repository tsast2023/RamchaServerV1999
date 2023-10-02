const mongoose = require('mongoose')
const db = process.env.DATABASE

mongoose.connect(db).then(()=>console.log('data base is connected')).catch((err)=>console.log(err.message))