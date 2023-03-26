const Store = require('../models/store');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const stores = await Store.find({});
    res.render('stores/index', { stores })
}

module.exports.renderNewForm = (req, res) => {
    res.render('stores/new');
}

module.exports.createStore = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.store.location,
        limit: 1
    }).send()
    const store = new Store(req.body.store);
    store.geometry = geoData.body.features[0].geometry;
    store.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    store.author = req.user._id;
    await store.save();
    req.flash('success', 'Successfully made a new store!');
    res.redirect(`/stores/${store._id}`)
}

module.exports.showStore = async (req, res,) => {
    const store = await Store.findById(req.params.id).populate({
        path: 'products',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!store) {
        req.flash('error', 'Cannot find that store!');
        return res.redirect('/stores');
    }
    res.render('stores/show', { store });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id)
    if (!store) {
        req.flash('error', 'Cannot find that store!');
        return res.redirect('/stores');
    }
    res.render('stores/edit', { store });
}

module.exports.updateStore = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.store.location,
        limit: 1
    }).send()
    const store = await Store.findByIdAndUpdate(id, { ...req.body.store });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    store.images.push(...imgs);
    store.geometry = geoData.body.features[0].geometry;
    await store.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await store.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated store!');
    res.redirect(`/stores/${store._id}`)
}

module.exports.deleteStore = async (req, res) => {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted store')
    res.redirect('/stores');
}