const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const multer= require('multer');
const {storage}=require("../cloudConfig.js")
const upload = multer({storage});
const listingController=require("../controller/listings.js");


//new route
router.get("/new",isLoggedIn,listingController.newForm);


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,validateListing,upload.single('listing[image]'),
    wrapAsync(listingController.createListings)
);






router.route("/:id").get(wrapAsync(listingController.showListings))
.put(isLoggedIn,upload.single("listing[image]"),isOwner,validateListing,wrapAsync(listingController.updateListings))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroylistings));


//edit route
 router.get("/:id/edit",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.editListings));



module.exports=router;
