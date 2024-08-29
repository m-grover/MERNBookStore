const router=require("express").Router();
const user=require("../models/user");
const { authenticateToken }=require("./userAuth");

//add book to fav
router.put("/add-book-to-favourite", authenticateToken, async(req,res)=>{
    try{
        const { bookId, id} = req.headers;
        const userData= await user.findById(id);
        const isBookFavourite = userData.favourites.includes(bookId);
        if(isBookFavourite){
            return res.status(200).json({message:"Book is already in favourites."});
        }
        await user.findByIdAndUpdate(id, {$push: {favourites:bookId}});
        return res.status(200).json({message:"Book added to favourites."});
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

//remove book from fav
router.put("/remove-book-from-favourite", authenticateToken, async(req,res)=>{
    try{
        const { bookId, id} = req.headers;
        const userData= await user.findById(id);
        const isBookFavourite = userData.favourites.includes(bookId);
        if(isBookFavourite){
            await user.findByIdAndUpdate(id, {$pull: {favourites:bookId}});
        }
        return res.status(200).json({message:"Book removed from favourites."});
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

//get the fov books of a particular user
router.get("/get-favourite-bboks", authenticateToken, async(req,res)=>{
    try{
        const {id} = req.headers;
        const userData= await user.findById(id).populate("favourites");
        const favouriteBooks = userData.favourites;
        
        return res.json({status:"Success", data:favouriteBooks,});
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

module.exports= router;