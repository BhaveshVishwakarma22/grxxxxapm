const express = require("express");
const router = express.Router();
const {getAllHouseSell, getUserHouseSell, addHouseSell, updateHouseSell, deleteHouseSell} = require("../controllers/houseSellController");


router.route(`/`).get(getAllHouseSell).post(addHouseSell).put(updateHouseSell).delete(deleteHouseSell);

router.route(`/:id`).patch(getUserHouseSell);


module.exports = router;