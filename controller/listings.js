
const Listing=require("../models/listing");
const mbxStyles = require('@mapbox/mapbox-sdk/services/styles');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
    const { category, q } = req.query;
    const validCategories = Listing.schema.path("category").enumValues;
    const filter = {};

    if (validCategories.includes(category)) {
        filter.category = category;
    }

    const search = typeof q === "string" ? q.trim() : "";
    if (search) {
        // escape regex special characters so user input is treated as plain text
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ title: regex }, { location: regex }, { country: regex }];
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", {
        allListings,
        category: filter.category || null,
        q: search,
    });
};


module.exports.newForm=async (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListings=async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    .populate({path:"reviews",
    populate:{
        path:"author",
    },
})
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};
module.exports.createListings=async (req,res,next)=>{
  let response=await geocodingClient.forwardGeocode({
  query:req.body.listing.location,
  limit: 1
})

  .send();





    let url =req.file.path;
    let filename=req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    await newListing.save();
    req.flash("success","New Listing added!");
    res.redirect("/listings");
    };

module.exports.editListings=async (req,res)=>{
        let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing You requested for Does Not Exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/uploads","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListings = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroylistings=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing removed!");
    res.redirect("/listings");
};