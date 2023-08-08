const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const { constants } = require("../constants");

function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}

//@desc Get all User
//@route GET /api/user
//@access public
const getUsers = (req, res)=>{
    let que = `SELECT * FROM users;`

    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(200).json(response);

        console.log(response);
    });
    // res.status(200).json({message:"Get All Users"});
};

//@desc Create User
//@route POST /api/user
//@access public
const createUser = async (req, res, next)=>{
    console.log(req.body)

    let {fname, lname, email, pass, phone, userPhoto} = req.body;

    if(!fname || !lname || !email || !pass || !phone || !userPhoto){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    //Check if exist
    const checkQuery = `SELECT * FROM users WHERE email = '${email}' OR phone = '${phone}' LIMIT 1;`
    connection.query(checkQuery, async (err, response)=>{
        if(err) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==0){
            //When user not exists
            const saltRounds = 10;
            // var hashedpass;
            bcrypt.hash(pass, saltRounds, (err2, hash) => {
                    // Store hash in your password DB.
                    if (err2) {
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error(err2.message));
                    }
                    console.log("Hashed Password: " + hash);
//Poko
                    const insertQuery = `INSERT INTO users (fname, lname, email, pass, phone, userPhoto)
                VALUES ('${fname}', '${lname}', '${email}', '${pass}', '${phone}', '${userPhoto}');`;

                    connection.query(insertQuery, (err3, response2) => {
                        if (err3) {
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error(err3.message));
                        }

                        console.log("User Registered!");
                        res.status(201).json(req.body);
                    });
                });

        }else{
            console.log("User exists!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("User exists!"));
        };
    });
};

function checkIfExists(res, next, email, callback){
    const qu = `SELECT * FROM users WHERE email = '${email}' LIMIT 1;`
    connection.query(qu,(err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        // console.log(parsedRes[0]["email"]);
        // console.log(parsedRes.length);
        if(!parsedRes.length){
            callback(-1);
        }else{
            
            console.log(response);
            callback(parsedRes[0]["id"]);
        }
    });

}

function checkIfExistsFromPhoneNo(res, next, phone, callback){
    const qu = `SELECT * FROM users WHERE phone = '${phone}' LIMIT 1;`
    connection.query(qu,(err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        // console.log(parsedRes[0]["email"]);
        // console.log(parsedRes.length);
        if(!parsedRes.length){
            callback(-1);
        }else{
            
            console.log(response);
            callback(parsedRes[0]["id"]);
        }
    });

}

//@desc Get User
//@route GET /api/user/1
//@access public
const getUser = async(req, res, next)=>{

    let {email} = req.body;
    if(!email){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Email required!"));
    }


    const qu = `SELECT * FROM users WHERE email = '${email}' LIMIT 1;`
    connection.query(qu,(err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        // console.log(parsedRes[0]["email"]);
        console.log(parsedRes.length);
        if(!parsedRes.length){
            console.log("User isn't found");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("User isn't found"));
            // return 0;
        }else{
            res.status(200).json(response);
            console.log(response);
            // return 1;
        }

    });
};


//@desc Update User
//@route PUT /api/user/:id
//@access public
const updateUser = async (req, res, next)=>{

    let {fname, lname, email, pass, phone, userPhoto} = req.body;

    if(!fname || !lname || !email || !pass || !phone || !userPhoto){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    //Get user id from email
    checkIfExists(res, next, email, (result)=>{ // 0 if not exists | 1 if exists
        console.log(result);
        if(result==-1){
            res.status(constants.NOT_FOUND);
            next(new Error("User Not Found!"));
        }else{
            const saltRounds = 10;
            // var hashedpass;
            bcrypt.hash(pass, saltRounds, (err2, hash) => {
                    // Store hash in your password DB.
                    if (err2) {
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error(err2.message));
                    }
                    console.log("Hashed Password: " + hash);

                    let updateQuery = `UPDATE users
                    SET fname = '${fname}',
                        lname = '${lname}',
                        email = '${email}',
                        pass = '${pass}',
                        phone = '${phone}',
                        userPhoto = '${userPhoto}'
                    WHERE id = ${result};
                    `;
                    connection.query(updateQuery, (err, response)=>{
                        if(err){
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error(err.message));
                        }
                        console.log(response);
                        res.status(200).json({message:`Update User for ${email}`});
                    });
            });//Poko
        }
    });
};


//@desc Update User Email
//@route PUT /api/user/email/:id
//@access public
const updateUserEmail = async (req, res, next)=>{

    let {fname, lname, email, pass, phone, userPhoto} = req.body;

    if(!fname || !lname || !email || !pass || !phone || !userPhoto){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    //Get user id from phone no
    checkIfExistsFromPhoneNo(res, next, phone, (result)=>{ // 0 if not exists | 1 if exists
        console.log(result);
        if(result==-1){
            res.status(constants.NOT_FOUND);
            next(new Error("User Not Found!"));
        }else{

            checkIfExists(res, next, email, (result2)=>{
                if(result2 == -1){
                    let updateQuery = `UPDATE users
                    SET fname = '${fname}',
                        lname = '${lname}',
                        email = '${email}',
                        pass = '${pass}',
                        phone = '${phone}',
                        userPhoto = '${userPhoto}'
                    WHERE id = ${result};
                    `;
                    connection.query(updateQuery, (err, response)=>{
                        if(err){
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error(err.message));
                        }
                        console.log(response);
                        res.status(200).json({message:`Update User for ${phone}`});
                    });
                }else{
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("User With specified email already exists!"));
                }
            });
            
        }
    });
};

//@desc Delete User
//@route DELETE /api/user/1
//@access public
const deleteUser = async (req, res, next)=>{

    let {email} = req.body;

    if(!email){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    //Get user id from email
    checkIfExists(res, next, email, (result)=>{ // 0 if not exists | 1 if exists
        console.log(result);
        if(result==-1){
            res.status(constants.NOT_FOUND);
            next(new Error("User Not Found!"));
        }else{
            let updateQuery = `DELETE FROM users WHERE id = ${result};`;
            connection.query(updateQuery, (err, response)=>{
                if(err){
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error(err.message));
                }
                console.log(response);
                res.status(200).json({message:`Deleted User for ${email}`});
            });
        }
    });
};



module.exports = {getUsers, getUser, createUser, updateUser, deleteUser, updateUserEmail};