const express= require("express");
const app=express();
const users = require("./routes/user");
const posts = require("./routes/post");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

app.use(session({secret:"mystring", 
    resave:false, 
    saveUninitialized:true } ));

app.use(flash());

app.get("/register",(req,res)=>{
    let {name="anonymous"}= req.query;
    req.session.name=name;
    req.flash("success", "User registered successfully");
    res.redirect("/hello");
})

app.get("/hello",(req,res)=>{
    res.locals.messages= req.flash("success");
    res.render("page.ejs", {name:req.session.name});
});

const PORT = 3000;
app.listen(PORT,()=>{
	console.log(`classroom server is running on http://localhost:${PORT}`);
});