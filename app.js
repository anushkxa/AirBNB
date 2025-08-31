const express = require("express");
const app = express();
const path=require("path");
const ejsMate= require("ejs-mate");
const mongoose = require("mongoose");
const Listing = require("./models/lisiting");
const methodOverride= require("method-override");
const multer = require("multer");
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);

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
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});

})

app.post("/listings", upload.single('image'), async (req,res)=>{
    try {
        const listingData = req.body.listing;
        
        // If an image was uploaded, add the image information
        if (req.file) {
            listingData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }
        
        const newListing = new Listing(listingData);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).send("Error creating listing");
    }
});

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

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});