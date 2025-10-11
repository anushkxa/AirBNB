const express = require("express");
const app = express();
const path=require("path");
const ejsMate= require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride= require("method-override");
const session = require("express-session");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter= require("./routes/user");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user");

app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));


app.get("/", (req, res) => {
    res.send("Hey I am root");
});

const sessionOptions={
    secret: "mysuper",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};
app.use(flash());

async function main(){
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
        console.log("Connected to DB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

main();
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser=req.user;
    next();
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



// Multer error handling
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash("error", "File too large. Maximum size allowed is 5MB.");
        return res.redirect("back");
    }
    if (err.message === 'Only image files are allowed!') {
        req.flash("error", "Only image files are allowed!");
        return res.redirect("back");
    }
    next(err);
});

app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    res.render("error.ejs",{message});
});
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});