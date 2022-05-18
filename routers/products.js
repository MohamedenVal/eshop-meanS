const { Product } = require('../models/product');
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { Store } = require('../models/store');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if(isValid) {
        uploadError = null;
    };

    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {

    const fileName = file.originalname.split(' ').join('-');
    const extention = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extention}`)
  }
})

const uploadOptions = multer({ storage: storage })

// get the products with the option to limiting the catagories
router.get(`/`, async (req, res) => {

    let productList;
    let filter = {};
    if(req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    try {
        productList = await Product.find(filter).populate('category').populate('store');
        
    } catch (error) {
        console.log("Erro loged in the console: ", error);
    }

    if (!productList) {
        res.status(500).json({success: false});
    }
    res.send(productList);
} );

// get the product with the specified id 
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category').populate('store');

    if (!product) {
        res.status(500).json({success: false, message: 'There is no product with the given id'});
    }
    res.send(product);
} );

// get the product with the specified id 
router.get(`/name/:name`, async (req, res) => {
    const product = await Product.find({ name: req.params.name });
    

    if (!product) {
        res.status(500).json({success: false, message: 'There is no product with the given id'});
    }
    res.send(product);
} );

// posting products to the database 
router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    // Making sure the category exists
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    // Making sure the store exists
    const store = await Store.findById(req.body.store);
    if(!store) return res.status(400).send('Invalid Store');

    // Making sure the request has a file path in it
    const file = req.file;
    if(!file) return res.status(400).send('No image in request');

    const fileName = req.file.filename;
    const basePath = `https://rimcode-rimmart-backend.herokuapp.com/public/uploads/`;
    
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        store: req.body.store,
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
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product id');
    }

    const category = await Category.findById(req.body.category);
    if(!category) {
        console.log(req.body.category);
        return res.status(400).send('Invalid Category ');
    }


    const store = await Store.findById(req.body.store);
    if(!store) {
        console.log(req.body.store);
        return res.status(400).send('Invalid Store ');
    }

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid product ');

    const file = req.file;
    let imagePath;

    if(file) {
        const fileName = file.filename;
        const basePath = `https://rimcode-rimmart-backend.herokuapp.com/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, 
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            store: req.body.store,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if(!updatedProduct) {
        return res.status(500).send('the product cannot be updated');
    }

    res.status(200).send(updatedProduct);
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

router.put(
    '/gallery-image/:id', 
    uploadOptions.array('images', 10),
    async (req, res) => {
        if(!mongoose.isValidObjectId(req.params.id)){
            res.status(400).send('Invalid product id');
        }

        const files = req.files;
        let imagesPaths = [];
        const basePath = `https://rimcode-rimmart-backend.herokuapp.com/public/uploads/`;
        if(files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                images: imagesPaths
            },
            { new: true }
        );

        if(!product) {
            return res.status(500).send('the product cannot be updated');
        }

        res.status(200).send(product);
});

module.exports = router;