const users = require('../models/User.model')

const authAdmin= async(req , res , next) => {
try {
    // console.log('req from browser',req.user)
    // get user information by id
    const user = await users.findOne({
        _id : req.user.user.id
    })
  
    if(user.isAdmin == false)
       return res.status(400).json({msg : "admin ressource acces denied"})
    next()
    
} catch (error) {
    return res.status(500).json({msg : error.message})  
}
}
module.exports = authAdmin
