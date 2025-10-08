const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { getDatabase } = require('../config/database');
const { cache } = require('../config/redis');
const { authenticateToken, authorize, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const cacheKey = 'categories:all';
    let categories = await cache.get(cacheKey);
    
    if (!categories) {
      const db = getDatabase();
      categories = await db('categories')
        .where({ is_active: true })
        .orderBy('sort_order', 'asc')
        .orderBy('name', 'asc');
      
      await cache.set(cacheKey, categories, 3600); // Cache for 1 hour
    }

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Get category by ID
router.get('/categories/:id', [
  param('id').isUUID().withMessage('Invalid category ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const cacheKey = `category:${id}`;
    let category = await cache.get(cacheKey);
    
    if (!category) {
      const db = getDatabase();
      category = await db('categories')
        .where({ id, is_active: true })
        .first();
      
      if (category) {
        await cache.set(cacheKey, category, 3600);
      }
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
});

// Create new category
router.post('/categories', [
  requireRole(['admin', 'manager']),
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('description').optional().isString(),
  body('image_url').optional().isURL(),
  body('sort_order').optional().isInt({ min: 0 }),
  body('parent_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const db = getDatabase();
    const categoryData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [category] = await db('categories')
      .insert(categoryData)
      .returning('*');

    // Clear cache
    await cache.del('categories:all');

    logger.info('Category created', { categoryId: category.id, userId: req.user.id });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

// Get all products
router.get('/products', [
  query('category_id').optional().isUUID(),
  query('is_available').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { category_id, is_available, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const db = getDatabase();
    let query = db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select(
        'products.*',
        'categories.name as category_name',
        'categories.slug as category_slug'
      );

    if (category_id) {
      query = query.where('products.category_id', category_id);
    }

    if (is_available !== undefined) {
      query = query.where('products.is_available', is_available === 'true');
    }

    const products = await query
      .orderBy('products.sort_order', 'asc')
      .orderBy('products.name', 'asc')
      .limit(limit)
      .offset(offset);

    const total = await db('products')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/products/:id', [
  param('id').isUUID().withMessage('Invalid product ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const cacheKey = `product:${id}`;
    let product = await cache.get(cacheKey);
    
    if (!product) {
      const db = getDatabase();
      product = await db('products')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select(
          'products.*',
          'categories.name as category_name',
          'categories.slug as category_slug'
        )
        .where('products.id', id)
        .first();
      
      if (product) {
        await cache.set(cacheKey, product, 1800); // Cache for 30 minutes
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Create new product
router.post('/products', [
  requireRole(['admin', 'manager']),
  body('name').notEmpty().withMessage('Name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category_id').isUUID().withMessage('Invalid category ID'),
  body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Invalid price'),
  body('cost').optional().isDecimal({ decimal_digits: '0,2' }),
  body('description').optional().isString(),
  body('image_url').optional().isURL(),
  body('modifiers').optional().isArray(),
  body('allergens').optional().isArray(),
  body('nutrition').optional().isObject(),
  body('is_marked').optional().isBoolean(),
  body('marking_code').optional().isString(),
  body('sort_order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const db = getDatabase();
    const productData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [product] = await db('products')
      .insert(productData)
      .returning('*');

    // Clear cache
    await cache.del('categories:all');

    logger.info('Product created', { productId: product.id, userId: req.user.id });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/products/:id', [
  requireRole(['admin', 'manager']),
  param('id').isUUID().withMessage('Invalid product ID'),
  body('name').optional().notEmpty(),
  body('sku').optional().notEmpty(),
  body('category_id').optional().isUUID(),
  body('price').optional().isDecimal({ decimal_digits: '0,2' }),
  body('cost').optional().isDecimal({ decimal_digits: '0,2' }),
  body('description').optional().isString(),
  body('image_url').optional().isURL(),
  body('modifiers').optional().isArray(),
  body('allergens').optional().isArray(),
  body('nutrition').optional().isObject(),
  body('is_available').optional().isBoolean(),
  body('is_marked').optional().isBoolean(),
  body('marking_code').optional().isString(),
  body('sort_order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const [product] = await db('products')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Clear cache
    await cache.del(`product:${id}`);
    await cache.del('categories:all');

    logger.info('Product updated', { productId: product.id, userId: req.user.id });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid product ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    const deleted = await db('products')
      .where({ id })
      .del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Clear cache
    await cache.del(`product:${id}`);
    await cache.del('categories:all');

    logger.info('Product deleted', { productId: id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

module.exports = { router };
