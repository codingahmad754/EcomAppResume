const express = require('express');
const router = express.Router();
const stores = require('../controllers/stores');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateStore } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Store = require('../models/store');

router.route('/')
    .get(catchAsync(stores.index))
    .post(isLoggedIn, upload.array('image'), validateStore, catchAsync(stores.createStore))


router.get('/new', isLoggedIn, stores.renderNewForm)

router.route('/:id')
    .get(catchAsync(stores.showStore))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateStore, catchAsync(stores.updateStore))
    .delete(isLoggedIn, isAuthor, catchAsync(stores.deleteStore));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(stores.renderEditForm))



module.exports = router;