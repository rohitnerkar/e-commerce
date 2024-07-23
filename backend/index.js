const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { error } = require("console");

const { port } = require("./config/keys");
const connectMongodb = require("./init/mongodb");


app.use(express.json());
app.use(cors());

connectMongodb();

// mongoose.connect("mongodb+srv://ecommerce:root@cluster0.zpdfqsd.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")

app.get("/", (req, res) => {
    res.send("Express app is running")
})

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async(req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    })
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,   
    })
})

app.post("/removeproduct", async(req, res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

app.get("/allproducts", async(req, res) => {
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);
})

const User = mongoose.model('User', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,  
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

app.post("/signup", async(req, res) => {
    let check = await User.findOne({email: req.body.email});
    if(check) {
        return res.status(400).json({success: false, error: "Existing user found with same email address"});
    }

    let cart = {};
    for(let i=0; i<300; i++){
        cart[i] = 0;
    }

    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })
    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({success: true, token})
})

app.post("/login", async(req, res) => {
    let user = await User.findOne({email: req.body.email});
    if(user) {
        const passMatch = req.body.password === user.password;
        if(passMatch) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success:true, token});
        } else {
            res.json({success:false, error:"Wrong Password"})
        }
    } else {
        res.json({success:false, error:"Wrong Email Address"})
    }
})

app.get("/newcollections", async(req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})

app.get("/popularproducts", async(req, res) => {
    let products = await Product.find({category: "men"});
    let popularproducts = products.slice(0, 4);
    console.log("Populat Products Fetched");
    res.send(popularproducts);
})

const fetchUser = async(req, res, next) => {
    const token = req.header('auth-token');
    if(!token) {
        res.status(401).send({error: "Please authenticate using valid login"})
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({error: "Please authenticate using a valid token"});
        }
    }
}

app.post("/addtocart", fetchUser, async(req, res) => {
    console.log("Added", req.body.itemId);
    let userData = await User.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send({message: "Added"});
})

app.post("/removefromcart", fetchUser, async(req, res) => {
    console.log("Removed", req.body.itemId);
    let userData = await User.findOne({_id: req.user.id});
    if(userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
    }
    await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send({message: "Removed"});
})

app.post("/getcart", fetchUser, async(req, res) => {
    console.log('Get Cart');
    let userData = await User.findOne({_id: req.user.id});
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if(!error) {
        console.log(`Server is running on port ${port}`);
    } else {
        console.log("Error: " + error);
    }
})

