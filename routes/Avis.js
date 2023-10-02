const router = require("express").Router()
const AvisController = require('../controllers/Avis')
const auth = require('../middlewares/auth.js')
const authAdmin = require("../middlewares/authAdmin")

router.post('/add/:id' , auth, AvisController.add);
router.get('/getAll',auth , authAdmin,AvisController.getAll);
router.get('/getAvis/:id',auth , AvisController.getavis);
router.delete('/delete/:id',auth,authAdmin ,AvisController.delete);






module.exports = router
