const express = require("express");
const router = express.Router();
const {getAllHouseSell, getUserHouseSell, addHouseSell, updateHouseSell, deleteHouseSell, getItemsByLocation} = require("../controllers/houseSellController");


router.route(`/`).get(getAllHouseSell).post(addHouseSell).put(updateHouseSell).delete(deleteHouseSell);

router.route(`/item/:location`).get(getItemsByLocation);

router.route(`/:id`).patch(getUserHouseSell);


module.exports = router;
