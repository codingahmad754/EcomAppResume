const Store = require('../models/store');
const Product = require('../models/product');
const Review = require('../models/review');

module.exports.renderProducts = async (req, res) => {
    res.send('hello')
}

module.exports.createProduct = async (req, res) => {
    const store = await Store.findById(req.params.id);
    const product = new Product(req.body.product);
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.author = req.user._id;
    store.products.push(product);
    await product.save();
    await store.save();
    req.flash('success', 'Created new product!');
    res.redirect(`/stores/${store._id}`);
}

module.exports.renderProductsShow = async (req, res) => {
    const { productId, id } = req.params
    const store = await Store.findById(req.params.id).populate({
        path: 'products',
        populate: {
            path: 'author'
        }
    }).populate('author')
    const product = await Product.findById(productId).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    console.log('please work')
    res.render('products/show', { product, store })
}

module.exports.createReview = async (req, res) => {
    const store = await Store.findById(req.params.id);
    const product = await Product.findById(req.params.productId)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    product.reviews.push(review);
    store.reviews.push(review)
    await review.save();
    await product.save();
    await store.save()
    req.flash('success', 'Created new review!');
    res.redirect(`/stores/${store._id}/products/${product._id}/show`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, productId, reviewId } = req.params;
    await Store.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/stores/${id}/products/${productId}/show`);
}

module.exports.deleteProduct = async (req, res) => {
    const { id, productId } = req.params;
    await Store.findByIdAndUpdate(id, { $pull: { products: productId } });
    await Product.findByIdAndDelete(productId);
    req.flash('success', 'Successfully deleted product')
    res.redirect(`/stores/${id}`);
}
