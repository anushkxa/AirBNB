const express = require("express");
const app = express();
const path=require("path");
const ejsMate= require("ejs-mate");
const mongoose = require("mongoose");
const Listing = require("./models/lisiting");
const methodOverride= require("method-override");
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));

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

app.post("/listings", async (req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect("/listings");
});

app.get("/listings/:id/edit", async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//update vala route
app.put("/listings/:id", async (req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
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