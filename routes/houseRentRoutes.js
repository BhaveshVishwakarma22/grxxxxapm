const express = require("express");
const router = express.Router();
const {getAllHouseRent, getUserHouseRent, addHouseRent, updateHouseRent, deleteHouseRent} = require("../controllers/houseRentController");


router.route(`/`).get(getAllHouseRent).post(addHouseRent).put(updateHouseRent).delete(deleteHouseRent);

router.route(`/:id`).patch(getUserHouseRent);


module.exports = router;