const express = require("express");
const router = express.Router();
const {getAllUserListing, addToMyListings, getUserListing, deleteListing, deleteAllListing, getUserListingItems} = require("../controllers/userListingController");


router.route(`/`).get(getAllUserListing).post(addToMyListings).delete(deleteListing);

router.route(`/all`).delete(deleteAllListing);

router.route(`/item/x`).patch(getUserListingItems);

router.route(`/:id`).patch(getUserListing);

module.exports = router;
