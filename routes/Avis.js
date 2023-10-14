const router = require("express").Router()
const AvisController = require('../controllers/Avis')
const auth = require('../middlewares/auth.js')
const authAdmin = require("../middlewares/authAdmin")

router.post('/add' , AvisController.add);
router.get('/getAll',auth,AvisController.getAll);
router.get('/getAvis/:id',auth , AvisController.getavis);
router.get('/getAllAvis' , auth , AvisController.getAllAvis);

router.delete('/delete/:id',auth,authAdmin ,AvisController.delete);
router.get('/getCount',AvisController.getCount)





module.exports = router
