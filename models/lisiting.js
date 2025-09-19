const mongoose= require("mongoose");
const { ref } = require("process");
const Schema= mongoose.Schema;

const listingSchema= new Schema({
    title:String,
    description:String,
    image:{
        filename:{
            type:String,
        },
        url:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ]
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;


