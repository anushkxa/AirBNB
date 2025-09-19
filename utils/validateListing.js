// utils/validateListing.js
const { listingSchema } = require("../schema.js");
const ExpressError = require("./expressError");

module.exports = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
