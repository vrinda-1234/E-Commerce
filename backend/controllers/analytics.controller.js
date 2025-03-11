import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";


export const getAnalyticsData=async()=>{
   const totalUsers=await User.countDocuments();
   const totalProducts=await Product.countDocuments();

   const salesData= await Order.aggregate(
    [
        {
            $group:{
                _id:null,//groups all documents together,
                totalSales:{$sum:1},
                totalRevenue:{$sum:"$totalAmount"}
            }
        }
    ]
   )

   const {totalSales,totalRevenue}=salesData[0] || {totalSales:0,totalRevenue:0};

   return {
    users:totalUsers,
    products:totalProducts,
    totalSales,
    totalRevenue
   }

}

export const getDailySalesData=async(startdate,endDate)=>{
    try {
        const dailySalesData= await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte: startdate, //get all order data if it is greater than startdate and less than end date
                        $lte: endDate,
                    },
                },
            },
            {
                $group:{ //group them in this format
                    _id:{ $dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},
                    sales:{ $sum: 1}, //for each day
                    revenue: { $sum:"$totalAmount"},
                },
            },
            { $sort:{_id:1}}, //Sorts the grouped data in ascending order by date.
        ]);
       // dailySalesData FORMAT= [
        //    { _id: "2025-03-11", sales: 5, revenue: 1000 },
        //    { _id: "2025-03-12", sales: 2, revenue: 500 }
        // ];
    
        const dateArray=getDatesInRange(startdate,endDate);
    
        return dateArray.map(date=>{
            const foundData= dailySalesData.find(item => item._id ===date);
    
            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            }
     // FINAL FORMAT [
      //{ "date": "2025-03-11", "sales": 5, "revenue": 1000 },
     // { "date": "2025-03-12", "sales": 2, "revenue": 500 },
     // { "date": "2025-03-13", "sales": 0, "revenue": 0 }
      //]
    
        })

        // ["2025-03-11","2025-03-12","2025-03-13"...] this format for a week
function getDatesInRange(startdate,endDate){
    const dates=[];
    let currentDate= new Date(startdate);

    while(currentDate<=endDate){
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate()+1);
    }

    return dates;
}
    
    
    } catch (error) {
        throw(error);
    }
}
