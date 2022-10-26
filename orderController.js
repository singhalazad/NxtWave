const Order = require('../models/order');
const Product = require('../models/product');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// create a new order => /api/v1/order/new
exports.newOrder = catchAsyncError(async (req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    })
})

//get a single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user','name email')
    
    if(!order){
        return next(new ErrorHandler('order not found on this id',400))
    }

    res.status(200).json({
        success: true,
        order
    })
})

//get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id})

    res.status(200).json({
        success: true,
        orders
    })
})

//admin routes
//get all orders => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()
    let totalAmount = 0;
    orders.forEach(order=>{
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//update order by admin => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler('No order found on this id', 400));
    }
    order.orderItems.forEach(async item=>{ 
        await updateStock(item.product, item.quantity)
    })
    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({ 
        sucess: true,
        message: 'Order updated successfully'
    })
})
async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false})
}

//delete order => /api/v1/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler('No order found on this id', 400));
    }

    order.remove();
    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    })
})