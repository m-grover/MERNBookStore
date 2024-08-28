const router=require("express").Router();
const user=require("../models/user");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const { authenticateToken }=require("./userAuth");

//Sign up
router.post("/sign-up", async (req, res) => {
    try {
        const{username, email, password, address}= req.body;

        //check username length is more than 4
        if(username.length < 4){
            return res
            .status(400)
            .json({message:"Username length should be atleast 4"});
        }

        //check username already exists?
        const existingUsername = await user.findOne({username: username});
        if(existingUsername){
            return res
            .status(400)
            .json({message:"Username already exists"})
        }

        //check if email already exists
        const existingEmail = await user.findOne({email:email});
        if(existingEmail){
            return res
            .status(400)
            .json({message:"Email already exists"})
        }

        //check pass
        if(password.length <= 5){
            return res.status(400)
            .json({message:"Password should contain atleast 6 characters."})
        }

        const hashPass= await bcrypt.hash(password, 10);

        const newUser= new user ({
            username: username, 
            email:email, 
            password:hashPass,
            address: address,
        });
        await newUser.save();
        return res
        .status(200)
        .json({message:"Signup successfully"})
    } catch(error){
        res.status(500).json({message:"Internal server error"});
    }
});

//sign in
router.post("/sign-in", async(req, res)=> {
    try{
        const { username, password} = req.body;

        const existingUser = await user.findOne({username});
        if(!existingUser){
            res.status(400).json({message:"Invalid credentials"});
        }

        await bcrypt.compare(password, existingUser.password, (err,data)=>{
            if(data){
                const authClaims=[
                    {name: existingUser.username},
                    {role:existingUser.role},
                ];

                const token=jwt.sign({authClaims}, "bookStore123", {expiresIn:"30d"})
                res.status(200).json({ 
                    id:existingUser._id, 
                    role:existingUser.role,
                    token: token 
                });
            } else {
                res.status(400).json({message:"Invalid credentials"});
            }
        });
    } catch(error){
        res.status(500).json({message:"Internal server error"});
    }
})

//get-user-info
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await user.findById(id).select("-password");
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//update address
router.put("/update-address", authenticateToken, async(req, res)=>{
    try{
        const{id}=req.headers;
        const {address}= req.body;
        await user.findByIdAndUpdate(id, {address: address});
        return res.status(200).json({message:"Address updated successfully"});
    } catch(error){
        res.status(500).json({message:"Internal server error"});
    }
})

module.exports=router;