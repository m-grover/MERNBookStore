const router=require("express").Router();
const user=require("../models/user");
const { authenticateToken }=require("./userAuth");

//add book to cart
router.put("/add-to-cart", authenticateToken, async(req,res)=>{
    try{
        const { bookId, id} = req.headers;
        const userData= await user.findById(id);
        const isBookInCart = userData.cart.includes(bookId);
        if(isBookInCart){
            return res.json({status:"Success",message:"Book is already in cart."});
        }
        await user.findByIdAndUpdate(id, {$push: {cart:bookId}});
        return res.json({message:"Book added to favourites."});
    } catch(error){
        return res.status(500).json({status:"Success",message:"Book added to cart."});
    }
})

//remove book from cart
router.delete("/remove-book-from-cart", authenticateToken, async(req,res)=>{
    try{
        const { bookId} = req.params;
        const { id} = req.headers;
        await user.findByIdAndUpdate(id, {$pull: {cart:bookId}});
        
        return res.json({message:"Book removed from cart."});
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

//get the fov books of a particular user
router.get("/get-user-cart", authenticateToken, async(req,res)=>{
    try{
        const {id} = req.headers;
        const userData= await user.findById(id).populate("cart");
        const cart = userData.cart.reverse;
        
        return res.json({status:"Success", data:cart,});
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

module.exports= router;