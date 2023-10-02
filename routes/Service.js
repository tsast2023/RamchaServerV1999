const router = require("express").Router()
const serviceController = require('../controllers/Service')
const auth = require('../middlewares/auth.js')
const authAdmin = require("../middlewares/authAdmin")

router.post('/add' , serviceController.add);
router.get('/getAll',serviceController.getAll);
router.get('/getService/:id',serviceController.getService);
router.delete('/delete/:id',serviceController.delete);
router.put('/update/:id',serviceController.update);






module.exports = router
