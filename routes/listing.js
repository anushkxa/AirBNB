const express = require("express");
const router = express.Router();
const multer = require("multer");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/lisiting")
const validateListing = require("../utils/validateListing.js");
const {isLoggedIn, isOwner}= require("../middleware.js");
const { valid } = require("joi");
const listingController = require("../controller/listing.js");

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
router.get("/", wrapAsync(listingController.index));

//adding naya
router.get("/new",isLoggedIn, listingController.renderNewFrom);

//will show all info of specific listing
router.get("/:id", wrapAsync(listingController.showListing));

router.post(
    "/",
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.createListing)
);

//edit
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.editListing))

//update vala route
router.put("/:id",isLoggedIn,
    isOwner,
    validateListing, upload.single("listing[image]"),
    wrapAsync(listingController.updateListing))

router.delete("/:id",isLoggedIn,isOwner,
    wrapAsync(listingController.deleteListing))

module.exports=router;