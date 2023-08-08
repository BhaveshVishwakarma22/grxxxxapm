const express = require("express");
const router = express.Router();
const {getAllFavorites, addToFavorites, getUserFavorite, deleteFavorites, deleteAllFavorites} = require("../controllers/favoriteController");


router.route(`/`).get(getAllFavorites).post(addToFavorites).delete(deleteFavorites);

router.route(`/all`).delete(deleteAllFavorites);

router.route(`/:id`).patch(getUserFavorite);

module.exports = router;