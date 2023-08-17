const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const { constants } = require("../constants");


function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}


function checkIfHouseSellExists(res, next, listItemId, callback) {
    const query = `SELECT * FROM house_sell_list WHERE list_item_id = '${listItemId}'`;
    connection.query(query, (err, response) => {
      if (err) {
        res.status(constants.VALIDATION_ERROR);
        return next(new Error(err.message));
      }
  
      const parsedRes = parseJsonFromRespone(response);
      if (!parsedRes.length) {
        callback(-1);
      } else {
        callback(listItemId);
      }
    });
  }

//@desc Get All house_sell_list 
//@route GET /house_sell/
//@access public
const getAllHouseSell = (req, res)=>{
    let que = `SELECT * FROM house_sell_list ;`;

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(200).json(response);

        console.log(parseJsonFromRespone(response));
    });
};

//@desc Get All house_sell_list 
//@route GET /house_sell/:id
//@access public
const getUserHouseSell = async(req, res, next)=>{
    let {list_item_id} = req.body;
    if(!list_item_id){
        res.status(constants.VALIDATION_ERROR);
        return next(new Error("list item id required!"));
    }

    let que = `SELECT * FROM house_sell_list WHERE list_item_id = '${list_item_id}';`;

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            return next(new Error(err.message));
        }
        
        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);
        if(parsedRes.length == 0){
            res.status(constants.VALIDATION_ERROR);
            return next(new Error("No House for sale Available"));
        }else{
            res.status(200).json(response);
            console.log(parsedRes);
        }
    });
};

//@desc Post HouseSell 
//@route POST /house_sell/
//@access public
const addHouseSell = async(req, res, next)=>{
    const { list_item_id, name, height, width, area, image, cost, location, bhk, br, prop_details, amenities } = req.body;
    if(!list_item_id || !name || !height || !width || !area || !image || !cost || !location ||!bhk ||!br ||!prop_details ||!amenities){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfHouseSellExists(res, next, list_item_id, (result)=>{
        if(result == -1){
            // Not present so we can add
            let addq = `INSERT INTO house_sell_list (list_item_id, name, height, width, area, image, cost, location, bhk, br, prop_details, amenities) 
            VALUES (
                '${list_item_id}',
                 '${name}', 
                 '${height}', 
                 '${width}', 
                 '${area}', 
                 '${image}', 
                 '${cost}', 
                 '${location}', 
                 '${bhk}', 
                 '${br}', 
                 '${prop_details}', 
                 '${amenities}');`;

            connection.query(addq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: "House for sale inserted successfully" });
              });
        }else{
            res.status(constants.VALIDATION_ERROR);
            return next(new Error("House for sale Already Exists!"));
        }
    });
};

//@desc Put HouseSell 
//@route PUT /house_sell/
//@access public
const updateHouseSell = async (req, res, next)=>{
    const { list_item_id, name, height, width, area, image, cost, location, bhk, br, prop_details, amenities } = req.body;
    if(!list_item_id || !name || !height || !width || !area || !image || !cost || !location ||!bhk ||!br ||!prop_details ||!amenities){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfHouseSellExists(res, next, list_item_id, (result)=>{
        if(result == -1){
            // Not present so we can't update'
            res.status(constants.NOT_FOUND);
            return next(new Error("House for sale Not Found!"));
        }else{

            let addq = `UPDATE house_sell_list SET 
            name = '${name}', 
            height = '${height}', 
            width = '${width}', 
            area = '${area}', 
            image = '${image}', 
            cost = '${cost}', 
            location = '${location}', 
            bhk = '${bhk}', 
            br = '${br}', 
            prop_details = '${prop_details}', 
            amenities = '${amenities}'
            WHERE list_item_id = '${list_item_id}'`;
             
            connection.query(addq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: `House for sale Updated successfully for ${list_item_id}` });
            });
        }
    });


};



//@desc GET All list items based on location
//@route GET /house_sell/item/:location
//@access public
const getItemsByLocation = async (req, res, next)=>{
  const location = req.params.location;

  const fetchPlotQuery = `
    SELECT * FROM plot_list WHERE location = ?;
  `;

  const fetchSellQuery = `
    SELECT * FROM house_sell_list WHERE location = ?;
  `;

  const fetchRentQuery = `
    SELECT * FROM house_rent_list WHERE location = ?;
  `;

  connection.query(fetchPlotQuery, [location], (errPlot, plotData) => {
    if (errPlot) {
      console.error('Error fetching plot data:', errPlot);
      res.status(500).json({ error: 'Error fetching plot data' });
    } else {
      connection.query(fetchSellQuery, [location], (errSell, sellData) => {
        if (errSell) {
          console.error('Error fetching sell data:', errSell);
          res.status(500).json({ error: 'Error fetching sell data' });
        } else {
          connection.query(fetchRentQuery, [location], (errRent, rentData) => {
            if (errRent) {
              console.error('Error fetching rent data:', errRent);
              res.status(500).json({ error: 'Error fetching rent data' });
            } else {
              const listItems = [];

              plotData.forEach((plot) => {
                listItems.push({
                  prop_image: plot.image,
                  prop_name: plot.name,
                  prop_details: `${plot.id}|₹${plot.cost}|${plot.area}`,
                  prop_mode: 'plot',
                  prop_location: plot.location
                });
              });

              sellData.forEach((sell) => {
                listItems.push({
                  prop_image: sell.image,
                  prop_name: sell.name,
                  prop_details: `${sell.list_item_id}|₹${sell.cost}|${sell.bhk}BHK`,
                  prop_mode: 'sell',
                  prop_location: sell.location
                });
              });

              rentData.forEach((rent) => {
                listItems.push({
                  prop_image: rent.image,
                  prop_name: rent.name,
                  prop_details: `${rent.list_item_id}|₹${rent.cost}|${rent.bhk}BHK`,
                  prop_mode: 'rent',
                  prop_location: rent.location
                });
              });

              res.status(200).json(listItems);
            }
          });
        }
      });
    }
  });
    
};




//@desc delete HouseSell
//@route DELETE /house_sell/
//@access public
const deleteHouseSell = async(req, res, next)=>{
    const { list_item_id } = req.body;
    if(!list_item_id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfHouseSellExists(res, next, list_item_id, (result)=>{
        if(result == -1){
            // Not present so we can't Delete'
            res.status(constants.NOT_FOUND);
            return next(new Error("House for sale Not Found!"));
        }else{

            let delq = `DELETE FROM house_sell_list WHERE list_item_id = '${list_item_id}'`;
             
            connection.query(delq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: `House for sale Deleted successfully for ${list_item_id}` });
            });
        }
    });
};





module.exports = {getAllHouseSell, getUserHouseSell, addHouseSell, updateHouseSell, deleteHouseSell, getItemsByLocation};
