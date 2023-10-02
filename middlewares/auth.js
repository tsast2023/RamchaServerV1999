const jwt = require ('jsonwebtoken')

const auth = (req , res , next) => {
try {
    const token = req.header("Authorization").split(" ")[1];
    console.log('token' , token )
    if(!token) return res.status(400).json({msg : 'Invalid Authentification'}) 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , (error , user)=>{
        if(error) {
          return res.status(400).json({msg : 'Token not valid'})
        } 
        
        req.user = user
        
        next()
    })
    
} catch (error) {
  return res.status(500).json({msg : error.message})  
}
}

module.exports = auth