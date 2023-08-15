const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const { constants } = require("../constants");


function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}

//@desc Get All Favorites
//@route GET /api/fav
//@access public
const getAllFavorites = (req, res)=>{
    let que = `SELECT * FROM favourites;`

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(200).json(response);

        console.log(parseJsonFromRespone(response));
    });
};

//@desc Get All users Favorites
//@route GET /api/fav/1
//@access public
const getUserFavorite = async(req, res, next)=>{
    let {userid} = req.body;
    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("User Id required!"));
    }

    const qu = `SELECT * FROM favourites WHERE userid = '${userid}';`
    connection.query(qu, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }
        
        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);
        if(!parsedRes.length){
            console.log("No available favourites for this user");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("No available favourites for this user!"));
        }else{
            res.status(200).json(response);
            console.log(parsedRes);
        }
    });
}

// Very Important Function
//@desc Get All users Favorites
//@route GET /api/fav/item/1
//@access public
const getUserFavoriteItems = async(req, res, next)=>{
    let {userid} = req.body;
    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("User Id required!"));
    }
    const fetchQuery = `
    SELECT listitemid
    FROM favourites
    WHERE userid = '${userid}';
  `;
  
  connection.query(fetchQuery, (err, rows) => {
    if (err) {
      console.error('Error fetching listitem ids:', err);
      res.status(500).json({ error: 'Error fetching listitem ids' });
    } else {
      const listitemIds = rows.map(row => row.listitemid);
      const data = [];
      
      listitemIds.forEach(listitemId => {
        const fetchDataQuery = `
          SELECT * FROM plot_list WHERE id = '${listitemId}';
        `;
        
        connection.query(fetchDataQuery, (fetchErr, plotData) => {
          if (fetchErr) {
            console.error('Error fetching plot data:', fetchErr);
          } else {
            const fetchRentDataQuery = `
              SELECT * FROM house_rent_list WHERE list_item_id = '${listitemId}';
            `;
            
            connection.query(fetchRentDataQuery, (rentErr, rentData) => {
              if (rentErr) {
                console.error('Error fetching rent data:', rentErr);
              } else {
                const fetchSellDataQuery = `
                  SELECT * FROM house_sell_list WHERE list_item_id = '${listitemId}';
                `;
                
                connection.query(fetchSellDataQuery, (sellErr, sellData) => {
                  if (sellErr) {
                    console.error('Error fetching sell data:', sellErr);
                  } else {
                    data.push({
                      listitemId,
                      plotData: plotData[0],
                      rentData: rentData[0],
                      sellData: sellData[0]
                    });
                    
                    if (data.length === listitemIds.length) {


                        // Formatiing
                        const formattedOutput = data.map(item => {
                            if (item.rentData) {
                              return {
                                prop_image: item.rentData.image,
                                prop_name: item.rentData.name,
                                prop_details: `${item.listitemId}|₹${item.rentData.cost}|${item.rentData.bhk}BHK`,
                                prop_mode: "rent",
                                prop_location: item.rentData.location
                              };
                            } else if (item.sellData) {
                              return {
                                prop_image: item.sellData.image,
                                prop_name: item.sellData.name,
                                prop_details: `${item.listitemId}|₹${item.sellData.cost}|${item.sellData.bhk}BHK`,
                                prop_mode: "sell",
                                prop_location: item.sellData.location
                              };
                            } else if (item.plotData) {
                              return {
                                prop_image: item.plotData.image,
                                prop_name: item.plotData.name,
                                prop_details: `${item.plotData.id}|₹${item.plotData.cost}|${item.plotData.area}sqft`,
                                prop_mode: "plot",
                                prop_location: item.plotData.location
                              };
                            }
                          });
                          console.log(JSON.stringify(formattedOutput, null, 2));
                        // console.log(data);
                        res.status(200).json(formattedOutput);
                    }
                  }
                });
              }
            });
          }
        });
      });
    }
  });
}



function checkIfFavExists(res, next, userid, listitemid, callback){
    const qu = `SELECT * FROM favourites WHERE userid = '${userid}' AND listitemid = '${listitemid}';`
    connection.query(qu,(err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        // console.log(parsedRes);
        if(!parsedRes.length){
            callback(-1);
        }else{
            
            callback(parsedRes[0]["userid"]);
        }
    });
}

//@desc Add to Favorites
//@route POST /api/fav
//@access public
const addToFavorites = async(req, res, next)=>{
    let {userid, listitemid} = req.body;

    if(!userid || !listitemid){
            //Item not in Favorites
            res.status(constants.VALIDATION_ERROR);
            
            next(new Error("All Fields are mandatory!"));
    }

    checkIfFavExists(res, next, userid, listitemid, (result)=>{
        if(result == -1){
            //Item not in Favorites
            let addq = `INSERT INTO favourites (userid, listitemid) VALUES ('${userid}', '${listitemid}');`;

            connection.query(addq, (err, response)=>{
                if(err){
                    console.log("scsc");
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Added to Favourites!");
                res.status(200).json(req.body);
            });
        }else{
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Already in Favourites!"));
        }
    });

}


//@desc Remove From Favorites
//@route DELETE /api/fav/all
//@access public
const deleteAllFavorites = async(req, res, next)=>{
    let {userid} = req.body;

    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }
    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    const qu = `SELECT * FROM favourites WHERE userid = '${userid}';`
    connection.query(qu,(err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        // console.log(parsedRes);
        if(!parsedRes.length){
            //Item not in Favorites
            res.status(constants.VALIDATION_ERROR);
            
            next(new Error("Item not in Favourites!"));
        }else{
            let delq = `DELETE FROM favourites
            WHERE userid = '${userid}';`;

            connection.query(delq, (err, response)=>{
                if(err){
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Removed to Favourites!");
                res.status(200).json({message:`Deleted List item for ${userid}`});
            });
        }
    });

}

//@desc Remove From Favorites
//@route DELETE /api/fav
//@access public
const deleteFavorites = async(req, res, next)=>{
    let {userid, listitemid} = req.body;

    if(!userid || !listitemid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    checkIfFavExists(res, next, userid, listitemid, (result)=>{
        console.log(result);
        if(result == -1){
            //Item not in Favorites
            res.status(constants.VALIDATION_ERROR);
            
            next(new Error("Item not in Favourites!"));
        }else{

            let delq = `DELETE FROM favourites
            WHERE userid = '${userid}'AND listitemid =  '${listitemid}';
            `;

            connection.query(delq, (err, response)=>{
                if(err){
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Removed to Favourites!");
                res.status(200).json({message:`Deleted List item for ${userid} and ${listitemid}`});
            });
        }
    });
}



module.exports = {getAllFavorites, addToFavorites, getUserFavorite, deleteFavorites, deleteAllFavorites, getUserFavoriteItems};
