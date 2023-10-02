const router = require("express").Router()
const orderController = require('../controllers/Order')
const auth = require('../middlewares/auth.js')
const authAdmin = require("../middlewares/authAdmin")

router.post('/add/:id' , orderController.add);
router.get('/getAll',orderController.getAll);
router.get('/getorder/:id',orderController.getorder);
router.delete('/delete/:id',orderController.delete);
router.put('/update/:id',orderController.update);
router.post('/sendprice',orderController.sendPrice);
router.post('/selectworker', orderController.selectWorker);
router.post('/getUserorders' , orderController.getAllbyuser)
router.post('/confirmFromWorker' , orderController.confirmFromWorker)


module.exports = router
