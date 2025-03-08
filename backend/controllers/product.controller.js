 import cloudinary from '../lib/cloudinary.js';
import Product from '../models/product.model.js';

// for admin only
 export const getAllProducts= async(req,res) =>{
    try{
        const products= await Product.find({}); //find all products
        res.json({products}); //return the products
    } catch(error){
        console.log("Error in getAllProducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
 }


 export const getFeaturedProducts=async (req,res)=>{
    try{
        //first try to fetch from redis
        let featuredProducts= await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredproducts));
        }

        //if not in redis then in mongodb
        featuredProducts= await Product.find({isFeatured:true}).lean(); //.lean will return a plain javascript object rather than a mongodb object

        if(!featuredProducts){
            return res.status(404).json({message:"No featured products found"});
        }

        //once found store in redis for future quick access

        await redis.set("featured_products",JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch(error){
        console.log("Error in getfeaturedproducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
 };

 export const createProduct=async(req,res)=>{
    try {
        const{ name,description,price,image,category}=req.body;

        let cloudinaryResponse= null;

        if(image){
            cloudinaryResponse= await cloudinary.uploader.upload(image,{folder:"products"});
        }

        const product= await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url:"",
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
 };

 export const deleteProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id)

        if(!product){
            return res.status(404).json({message:"Product not Found"});
        }

        if(product.image){
            const publicId=product.image.split("/").pop().split(".")[0]; // get the id of the image
            try {
             await cloudinary.uploader.destroy(`products/${publicId}`)
             console.log("deleted image from clodinary")
            } catch (error) {
                console.log("error deleting image from clodinary",error)
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({message:"Product deleted successfully"})
    } catch (error) {
        console.log("Error in deleteProduct controller",error.message)
        res.status(500).json({ message: "Server error",error:error.message})
    }
 };

 //aggregation pipelining in mongodb
 export const getRecommendedProducts= async(req,res) =>{
     try {
        const products= await Product.aggregate([
            {
                $sample:{size:3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])

        res.json(products)
     } catch (error) {
        console.log("Error in getRecommendedProducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
     }
 }

 export const getProductsByCategory=async(req,res) =>{
    const {category}= req.params;
    try {
        const products=await Product.find({category});
        res.json(products);
    } catch (error) {
        console.log("Error in getProductsbyCategory controller",error.message);
        res.staus(500).json({message:"Server error",error:error.message});
    }
 }

 export const toggleFeaturedProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id);
        if(product){
            product.isFeatured=!product.isFeatured;
            const updatedProduct= await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else{
            res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
        console.log("Error in toggleFeaturedproduct controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
 }

 async function updateFeaturedProductsCache(){
    try{
        const featuredProducts=await Product.find({isFeatured:true}).lean();
        await redis.set("featured_products",JSON.stringify(featuredProducts));
    }
    catch(error){
        console.log("error in update catch fucntion")
    }
 }