const express = require("express");
const app = express();
const path=require("path");
const mongoose = require("mongoose");
const Listing = require("./models/lisiting");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

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

//will show  all info of specific hotel hheehe
app.get("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});

})


app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});