const Listing = require("../models/lisiting");

module.exports.index= async (req, res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewFrom = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
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
};

module.exports.createListing= async (req, res, next) => {
        const listingData = req.body.listing;
        let filename= req.file.filename;
        let url = req.file.path;
        if (req.file) {
            listingData.image = {
                filename: req.file.filename,
                url: `/images/listings/${req.file.filename}`
            };
        }
        const newListing = new Listing(listingData);
        newListing.owner= req.user._id;
        newListing.image = {url, filename};
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
};

module.exports.editListing = async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing = async (req,res)=>{
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
};

module.exports.deleteListing = async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("deleted");
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};