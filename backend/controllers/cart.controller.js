import Product from "../models/product.model.js";

export const addToCart=async(req,res) =>{
    try{
        const {productId}= req.body;
        const user =req.user;

        const existingItem =user.cartItems.find(item=> item.id ===productId); //.find() searches user.cartItems (the list of products in the user's cart) to see if the product already exists.
        if(existingItem){
            existingItem.quantity+=1;// If product exists, increase quantity
        }else{
            user.cartItems.push(productId);//If not, add product to cart
        }

        await user.save();
        res.json(user.cartItems)
    } catch(error){
        console.log("Error in addToCart controller",error.message);
        res.status(500).json({message:"Server error",error: error.message});
    }
}

export const removeAllfromCart=async(req,res) =>{
    try {
        const {productId} =req.body;
        const user= req.user;
        if(!productId){
            user.cartItems=[];
        } else{
            user.cartItems=user.cartItems.filter((item)=> item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) { 
        console.log("Error in removeallfromcart controller",error.message);
        res.status(500).json({message:"Server error",error: error.message});
    }
}

export const updateQuantity=async(req,res)=>{
    try {
        const {id:productId} =req.params;
        const {quantity}= req.body;
        const user=req.user;
        const existingItem=user.cartItems.find((item)=> item.id === productId);

        if(existingItem){
            if(quantity === 0){
                user.cartItems=user.cartItems.filter((item)=> item.id!==productId);
                await user.save();
                return res.json(user.cartItems);
            }

            existingItem.quantity= quantity;
            await user.save();
            return res.json(user.cartItems);
        } else{
           res.status(404).json({message:"product not found"});
        }
    } catch (error) {
        console.log("Error in updateQuantity controller",error.message);
        res.status(500).json({message:"Server error",error: error.message});
    }
}

export const getCartProducts=async(req,res)=>{
    try {
       const products =await Product.find({_id:{$in:req.user.cartItems}});

       //add quantity for each product
       const cartItems=products.map(product=>{
        const item=req.user.cartItems.find(cartItem => cartItem.id===product.id);
        return {...product.toJSON(),quantity:item.quantity}
       })

       res.json(cartItems);
    } catch (error) {
        console.log("Error in getcartproducts controller",error.message);
        res.status(500).json({message:"Server error",error: error.message});
    }
}


