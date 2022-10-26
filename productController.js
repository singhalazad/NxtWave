const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

//Get all products => /api/v1/products
exports.getProducts = async (req, res, next) => {
  const resPerPage = 8;
  const productCount = await Product.countDocuments();

  const apiFeatures = new APIFeatures(Product, req.query)
    .search()
    .filter()
    .pagination(resPerPage);

  const products = await apiFeatures.query;

  setTimeout(() => {
    res.status(200).json({
      success: true,
      productsCount: productCount,
      products,
    });
  }, 500);
};

//Get single product from id => /api/v1/product/:id
exports.getSingleProduct = async (req, res, next) => {
  const singleProduct = await Product.findById(req.params.id);

  if (!singleProduct) {
    return next(new ErrorHandler("Product not found", 404));
  } else {
    res.status(200).json({
      status: true,
      message: "Product found",
      singleProduct,
    });
  }
};

//Create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//Update product from id => /api/v1/admin/product/:id
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
};

//Removing product from id => /api/v1/admin/product/:id
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};
