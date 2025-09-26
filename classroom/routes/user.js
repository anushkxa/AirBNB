const express= require("express");
const router= express.Router();

//INDEX
router.get("/users",(req,res)=>{
    res.send("GET for users");
});

//show
router.get("/user/:id",(req,res)=>{
    res.send("get for users id");
});

//POST
router.post("/users",(req,res)=>{
    res.send("POST for users");
});

//delete
router.delete("/users/:id",(req,res)=>{
    res.send("DELETE for user id");
});

module.exports= router;
