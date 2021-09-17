const {Product} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// get the products with the option to limiting the catagories
router.get(`/`, async (req, res) => {

    let filter = {};
    if(req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const productList = await Product.find(filter);

    if (!productList) {
        res.status(500).json({success: false});
    }
    res.send(productList);
} );

// get the product with the specified id 
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(500).json({success: false, message: 'There is no product with the given id'});
    }
    res.send(product);
} );

// posting products to the database 
router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();

    if(!product)
    return res.status(500).send('The product cannot be created ');

    res.send(product);
} );

// updating a specific product
router.put('/:id', async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product id');
    }

    const category = await Category.findById(req.body.category);
    if(!category) {
        return res.status(400).send('Invalid Category ');
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, 
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if(!product) {
        return res.status(500).send('the product cannot be updated');
    }

    res.status(200).send(product);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if(product) {
            return res.status(200).json({ success: true, message: 'the product was deleted.'})
        } else {
            return res.status(404).json.apply({success: false, message: "product not found"})
        }
    }).catch( err => {
        return res.status(400).json({success: false, error: err });
    });

});

// getting the product count 
router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({success: false});
    }
    res.send({
        productCount: productCount
    });
});

// getting the featured products
router.get('/get/featured/:count', async (req, res) => {
    let count = req.params.count ? +req.params.count : 0;

    const products = await Product.find( { isFeatured: true } ).limit(count);

    if (!products) {
        res.status(500).json({success: false});
    }
    res.send(products);
});


module.exports = router;