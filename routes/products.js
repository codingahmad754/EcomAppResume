const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateProduct, isLoggedIn, isProductAuthor } = require('../middleware');
// const Store = require('../models/store');
// const Product = require('../models/product');
const product = require('../controllers/products');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



router.post('/', isLoggedIn, upload.array('image'), validateProduct, catchAsync(product.createProduct))

router.get('/:productId/show', isLoggedIn, catchAsync(product.renderProductsShow))

router.post('/:productId/show', isLoggedIn, catchAsync(product.createReview))


router.delete('/:productId/show/:reviewId', isLoggedIn, catchAsync(product.deleteReview))
router.delete('/:productId', isLoggedIn, isProductAuthor, catchAsync(product.deleteProduct))

module.exports = router;