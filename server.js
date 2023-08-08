const express = require("express");
const mysql = require("mysql");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();

const app = express();
const db = require('./dbConnection/connectMySQL');

const port = process.env.PORT|| 5000;
// maindb
app.use(express.json());
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/fav", require("./routes/fovouritesRoutes"));
app.use("/api/listing", require("./routes/ListingsRoutes"));
app.use("/api/plot", require("./routes/plotListRoutes"));
app.use("/api/house_sell", require("./routes/houseSellRoutes"));
app.use("/api/house_rent", require("./routes/houseRentRoutes"));

app.use(errorHandler);

app.get("/api/yo", (req, res)=>{
    res.send("Yo");
});

app.listen(port, ()=>{
    console.log(`Server Running on port ${port}`);
});