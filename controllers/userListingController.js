const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const { constants } = require("../constants");


function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}

//@desc Get All listing
//@route GET /listing/fav
//@access public
const getAllUserListing = (req, res)=>{
    let que = `SELECT * FROM id_user_listing;`;

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(200).json(response);

        console.log(parseJsonFromRespone(response));
    });
};

//@desc Get All users listing
//@route GET /api/listing/1
//@access public
const getUserListing = async(req, res, next)=>{
    let {userid} = req.body;
    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("User Id required!"));
    }

    const qu = `SELECT * FROM id_user_listing WHERE userid = '${userid}';`;
    connection.query(qu, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }
        
        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);
        if(!parsedRes.length){
            console.log("No available id_user_listing for this user");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("No available id_user_listing for this user!"));
        }else{
            res.status(200).json(response);
            console.log(parsedRes);
        }
    });
}

function checkIfFavExists(res, next, userid, listitemid, callback){
    const qu = `SELECT * FROM id_user_listing WHERE userid = '${userid}' AND listitemid = '${listitemid}';`;
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

//@desc Add to listing
//@route POST /api/listing
//@access public
const addToMyListings = async(req, res, next)=>{
    let {userid, listitemid} = req.body;

    if(!userid || !listitemid){
        //Item not in Favorites
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfFavExists(res, next, userid, listitemid, (result)=>{
        if(result == -1){
            //Item not in Favorites
            let addq = `INSERT INTO id_user_listing (userid, listitemid) VALUES ('${userid}', '${listitemid}');`;

            connection.query(addq, (err, response)=>{
                if(err){
                    console.log("scsc");
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Added to id_user_listing!");
                res.status(200).json(req.body);
            });
        }else{
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Already in id_user_listing!"));
        }
    });

}


//@desc Remove From listing
//@route DELETE /api/listing/all
//@access public
const deleteAllListing = async(req, res, next)=>{
    let {userid} = req.body;

    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }
    if(!userid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    const qu = `SELECT * FROM id_user_listing WHERE userid = '${userid}';`;
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
            
            next(new Error("Item not in id_user_listing!"));
        }else{
            let delq = `DELETE FROM id_user_listing
            WHERE userid = '${userid}';`;

            connection.query(delq, (err, response)=>{
                if(err){
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Removed to id_user_listing!");
                res.status(200).json({message:`Deleted List item for ${userid}`});
            });
        }
    });

}

//@desc Remove From listing
//@route DELETE /api/listing
//@access public
const deleteListing = async(req, res, next)=>{
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
            
            next(new Error("Item not in id_user_listing!"));
        }else{

            let delq = `DELETE FROM id_user_listing
            WHERE userid = '${userid}'AND listitemid =  '${listitemid}';
            `;

            connection.query(delq, (err, response)=>{
                if(err){
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }

                console.log("Removed to id_user_listing!");
                res.status(200).json({message:`Deleted List item for ${userid} and ${listitemid}`});
            });
        }
    });
}



module.exports = {getAllUserListing, addToMyListings, getUserListing, deleteListing, deleteAllListing};