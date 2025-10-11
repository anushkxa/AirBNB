const express = require("express");
const router = express.Router();
const multer = require("multer");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/lisiting")
const validateListing = require("../utils/validateListing.js");
const {isLoggedIn, isOwner}= require("../middleware.js");
const { valid } = require("joi");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/listings/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
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

//just showing all the list of hotles hehehe
router.get("/", async (req, res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});});

//adding naya
router.get("/new",isLoggedIn, (req,res)=>{
    res.render("listings/new.ejs");
})

//will show all info of specific listing
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
});

router.post(
    "/",
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(async (req, res, next) => {
        const listingData = req.body.listing;

        if (req.file) {
            listingData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }
        const newListing = new Listing(listingData);
        newListing.owner= req.user._id;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    })
);

//edit
router.get("/:id/edit",isLoggedIn,isOwner, async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
})

//update vala route
router.put("/:id",isLoggedIn,
    isOwner,
    validateListing, upload.single('image'), async (req,res)=>{
        let{id}=req.params;
        const updateData = {...req.body.listing};
        // If a new image was uploaded
        if (req.file) {
            updateData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }
        await Listing.findByIdAndUpdate(id, updateData);
        res.redirect(`/listings/${id}`);

});

router.delete("/:id",isLoggedIn,isOwner, async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("deleted");
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
})

module.exports=router;