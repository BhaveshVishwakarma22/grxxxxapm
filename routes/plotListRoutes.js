const express = require("express");
const router = express.Router();
const {getAllPlot, getUserPlot, addPlot, updatePlot, deletePlot} = require("../controllers/plotListController");


router.route(`/`).get(getAllPlot).put(updatePlot).delete(deletePlot).post(addPlot);

router.route(`/:ij`).patch(getUserPlot);


module.exports = router;