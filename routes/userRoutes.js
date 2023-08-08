const express = require("express");
const router = express.Router();
const {getUsers, getUser, createUser, updateUser, deleteUser, updateUserEmail} = require("../controllers/userController");


router.route(`/`).get(getUsers).post(createUser);

router.route(`/:id`).put(updateUser).delete(deleteUser);
// router.route(`/:id`).get(getUser).put(updateUser).delete(deleteUser);
router.route(`/:id`).patch(getUser);

router.route(`/email/:id`).put(updateUserEmail);


module.exports = router;