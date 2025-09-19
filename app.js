const express = require("express");
const app = express();
const path=require("path");
const ejsMate= require("ejs-mate");
const mongoose = require("mongoose");
const Listing = require("./models/lisiting");
const methodOverride= require("method-override");
const multer = require("multer");
const wrapAsync=require("./utils/wrapAsync.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const Review= require("./models/review.js");


app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
const expressError=require("./utils/expressError.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/listings/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

async function main(){
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
        console.log("Connected to DB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

main();

app.get("/", (req, res) => {
    res.send("Hey I am root");
});

//just showing all the list of hotles hehehe
app.get("/listings", async (req, res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});});

//adding naya
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
})

//will show  all info of specific hotel hheehe
app.get("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});

})

//main vala
const validateListing = require("./utils/validateListing.js");
const ExpressError = require("./utils/expressError.js");

app.post(
    "/listings",
    upload.single("image"),
    validateListing,   // ✅ now it’s a function
    wrapAsync(async (req, res, next) => {
        const listingData = req.body.listing;

        if (req.file) {
            listingData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }

        const newListing = new Listing(listingData);
        await newListing.save();
        res.redirect("/listings");
    })
);


app.get("/listings/:id/edit", async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//update vala route
app.put("/listings/:id", upload.single('image'), async (req,res)=>{
    try {
        let{id}=req.params;
        const updateData = {...req.body.listing};

        // If a new image was uploaded, update the image information
        if (req.file) {
            updateData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }

        await Listing.findByIdAndUpdate(id, updateData);
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).send("Error updating listing");
    }
});

app.delete("/listings/:id", async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("deleted");
    res.redirect("/listings");
})

const validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if (error){
        let errMsg =error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    };
}

//review route starts here

app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

app.delete("/listing/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))




app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    res.render("error.ejs",{message});
});
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});