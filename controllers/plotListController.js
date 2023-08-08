const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const { constants } = require("../constants");


function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}


function checkIfPlotExists(res, next, id, callback) {
    const query = `SELECT * FROM plot_list WHERE id = '${id}'`;
    connection.query(query, (err, response) => {
      if (err) {
        res.status(constants.VALIDATION_ERROR);
        return next(new Error(err.message));
      }
  
      const parsedRes = parseJsonFromRespone(response);
      if (!parsedRes.length) {
        callback(-1);
      } else {
        callback(id);
      }
    });
  }

//@desc Get All plot_list 
//@route GET /plot/
//@access public
const getAllPlot = (req, res)=>{
    let que = `SELECT * FROM plot_list ;`;

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(200).json(response);

        console.log(parseJsonFromRespone(response));
    });
};

//@desc Get All plot_list 
//@route GET /plot/:id
//@access public
const getUserPlot = async(req, res, next)=>{
    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        return next(new Error("list item id required!"));
    }

    let que = `SELECT * FROM plot_list WHERE id = '${id}';`;

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            return next(new Error(err.message));
        }
        
        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);
        if(parsedRes.length == 0){
            res.status(constants.VALIDATION_ERROR);
            return next(new Error("No Plot Available"));
        }else{
            res.status(200).json(response);
            console.log(parsedRes);
        }
    });
};

//@desc Post plot 
//@route POST /plot/
//@access public
const addPlot = async(req, res, next)=>{
    const { id, name, height, width, area, image, cost, location } = req.body;
    if(!id || !name || !height || !width || !area || !image || !cost || !location){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfPlotExists(res, next, id, (result)=>{
        if(result == -1){
            // Not present so we can add
            let addq = `INSERT INTO plot_list (id, name, height, width, area, image, cost, location) VALUES ('${id}', '${name}', '${height}', '${width}', '${area}', '${image}', '${cost}', '${location}');`;
            connection.query(addq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: "Plot inserted successfully" });
              });
        }else{
            res.status(constants.VALIDATION_ERROR);
            return next(new Error("Plot Alread Exists!"));
        }
    });
};

//@desc Put plot 
//@route PUT /plot/
//@access public
const updatePlot = async (req, res, next)=>{
    const { id, name, height, width, area, image, cost, location } = req.body;
    if(!id || !name || !height || !width || !area || !image || !cost || !location){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfPlotExists(res, next, id, (result)=>{
        if(result == -1){
            // Not present so we can't update'
            res.status(constants.NOT_FOUND);
            return next(new Error("Plot Not Found!"));
        }else{

            let addq = `UPDATE plot_list 
            SET name = '${name}',
             height = '${height}', 
             width = '${width}', 
             area = '${area}', 
             image = '${image}', 
             cost = '${cost}', 
             location = '${location}' 
             WHERE id = '${id}';`;
             
            connection.query(addq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: `Plot Updated successfully for ${id}` });
            });
        }
    });

    console.log("Update Plot");
};


//@desc delete Plot
//@route DELETE /plot/
//@access public
const deletePlot = async(req, res, next)=>{
    const { id } = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are mandatory!"));
    }

    checkIfPlotExists(res, next, id, (result)=>{
        if(result == -1){
            // Not present so we can't Delete'
            res.status(constants.NOT_FOUND);
            return next(new Error("Plot Not Found!"));
        }else{

            let delq = `DELETE FROM plot_list WHERE id = '${id}'`;
             
            connection.query(delq, (err, result) => {
                if (err) {
                  res.status(constants.VALIDATION_ERROR);
                  return next(new Error(err.message));
                }
            
                res.status(200).json({ message: `Plot Deleted successfully for ${id}` });
            });
        }
    });
};





module.exports = {getAllPlot, getUserPlot, addPlot, updatePlot, deletePlot};