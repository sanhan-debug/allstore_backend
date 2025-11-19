import Product from '../Models/productModel.js';

// Bütün məhsulları gətir
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Məhsulları gətirərkən xəta baş verdi',
      error: error.message
    });
  }
};

// Tək məhsulu gətir (slug və ya ID ilə)
export const getProduct = async (req, res) => {
  try {
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('Request URL:', req.originalUrl);
    
    // Route-da :id və ya :slug ola bilər
    const slug = req.params.slug || req.params.id || req.params[0];
    
    if (!slug || slug === 'undefined' || slug === 'null' || slug.trim() === '') {
      console.error('Slug is missing or invalid:', slug);
      return res.status(400).json({
        success: false,
        message: 'Slug və ya ID təqdim edilməlidir',
        received: slug
      });
    }
    
    const cleanSlug = String(slug).trim();
    console.log('Get product requested with (cleaned):', cleanSlug);
    
    // Slug və ya ID ilə məhsul tap
    let product = null;
    
    // MongoDB ObjectId formatındadırsa, ID ilə tap
    if (cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Searching by ID:', cleanSlug);
      product = await Product.findById(cleanSlug);
    } else {
      // Slug ilə tap
      console.log('Searching by slug:', cleanSlug);
      product = await Product.findOne({ slug: cleanSlug });
      
      // Slug ilə tapılmadısa, ID kimi yoxla (köhnə məhsullar üçün)
      if (!product) {
        console.log('Not found by slug, trying as ID:', cleanSlug);
        // ID formatında olub olmadığını yoxla
        if (cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
          product = await Product.findById(cleanSlug);
        }
      }
    }
    
    if (!product) {
      console.log('Product not found:', slug);
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }

    console.log('Product found:', product.name, product.slug || 'No slug');
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Məhsulu gətirərkən xəta baş verdi',
      error: error.message
    });
  }
};

// Yeni məhsul əlavə et (only admin)
export const createProduct = async (req, res) => {
  try {
    console.log('Request headers:', req.headers);
    console.log('User from middleware:', req.user);

    const {
      name,
      price,
      category,
      imageUrl,
      description,
      inStock,
      isWeightBased,
      pricePerKg,
      images = [],
      isSized = false,
      sizeType,
      availableSizes = []
    } = req.body;

    // Məcburi sahələri yoxla
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Ad və kateqoriya məcburidir'
      });
    }

    // Çəki ilə satılır olsa, pricePerKg məcburidir
    if (isWeightBased && (!pricePerKg || isNaN(pricePerKg) || pricePerKg <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Çəki ilə məhsul üçün kq başına qiymət məcburidir'
      });
    }

    // Çəki ilə satılır deyilsə, price məcburidir
    if (!isWeightBased && (!price || isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Qiymət məcburidir və düzgün formatda olmalıdır'
      });
    }

    const validCategories = [
      'İçkilər',
      'Şirniyyat',
      'Süd məhsulları',
      'Məişət Əşyaları',
      'Un məmulatları',
      'Ət məhsulları',
      'Meyvə-tərəvəz',
      'Qəlyanaltılar',
      'Konservlər',
      'Yağlar',
      'Ərzaq',
      'Geyim',
      'Təmir Materialları',
      'Oyuncaq'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Yanlış kateqoriya'
      });
    }

    // Yeni məhsul yarat
    const productData = {
      name: name.trim(),
      category,
      imageUrl: imageUrl || '',
      images: Array.isArray(images) && images.length > 0 ? images : [],
      description: description?.trim() || '',
      inStock: inStock ?? true,
      isWeightBased: isWeightBased ?? false,
      // Ölçülü məhsul (Geyim kateqoriyası üçün)
      isSized: category === 'Geyim' && isSized === true,
      sizeType: category === 'Geyim' && isSized ? (sizeType || null) : null,
      availableSizes: category === 'Geyim' && isSized && Array.isArray(availableSizes) ? availableSizes : [],
      ...(isWeightBased 
        ? { 
            pricePerKg: Number(pricePerKg),
            price: Number(pricePerKg) / 1000 // 1 qram üçün qiymət
          }
        : {
            price: Number(price),
            pricePerKg: 0
          }
      )
    };

    console.log('Yaradılacaq məhsul datası:', productData);

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Məhsul yaratma xətası:', error);
    res.status(500).json({
      success: false,
      message: 'Məhsul əlavə edilərkən xəta baş verdi',
      error: error.message
    });
  }
};

// Məhsulu yenilə (only admin)
export const updateProduct = async (req, res) => {
  try {
    const { name, price, category, imageUrl, images, description, inStock, isWeightBased, pricePerKg, isSized, sizeType, availableSizes } = req.body;

    // Çəki ilə satılır olsa, pricePerKg məcburidir
    if (isWeightBased && (!pricePerKg || isNaN(pricePerKg) || pricePerKg <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Çəki ilə məhsul üçün kq başına qiymət məcburidir'
      });
    }

    // Çəki ilə satılır deyilsə, price məcburidir
    if (!isWeightBased && (!price || isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Qiymət məcburidir və düzgün formatda olmalıdır'
      });
    }

    // Update data hazırla
    const updateData = {
      ...req.body,
      images: Array.isArray(images) && images.length > 0 ? images : (req.body.images || []),
      // Ölçülü məhsul (Geyim kateqoriyası üçün)
      isSized: category === 'Geyim' && isSized === true,
      sizeType: category === 'Geyim' && isSized ? (sizeType || null) : null,
      availableSizes: category === 'Geyim' && isSized && Array.isArray(availableSizes) ? availableSizes : [],
      // Çəki ilə satılır olsa, price-i avtomatik hesabla (1 qram üçün)
      // Çəki ilə satılır deyilsə, price-i yaz
      ...(isWeightBased
        ? {
            pricePerKg: Number(pricePerKg),
            price: Number(pricePerKg) / 1000 // 1 qram üçün qiymət
          }
        : {
            price: Number(price),
            pricePerKg: 0
          }
      )
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Məhsul yeniləndikdə xəta baş verdi',
      error: error.message
    });
  }
};

// Məhsulu sil (only admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Məhsul uğurla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Məhsul silinərkən xəta baş verdi',
      error: error.message
    });
  }
};

// Kateqoriyaya görə məhsulları gətir
export const getProductsByCategory = async (req, res) => {
  try {
    let category = req.params.category;
    
    // URL-dən category parametrini decode et
    if (category) {
      try {
        category = decodeURIComponent(category);
      } catch (e) {
        // Əgər decode olunmursa, olduğu kimi istifadə et
        console.log('Category decode error, using as is:', category);
      }
    }
    
    console.log('Fetching products for category:', category);
    
    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Kateqoriya adı təqdim edilməlidir'
      });
    }
    
    const products = await Product.find({ category: category.trim() });
    
    console.log(`Found ${products.length} products for category: ${category}`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Kateqoriya məhsullarını gətirərkən xəta baş verdi',
      error: error.message
    });
  }
};

// Stokda olan məhsulları gətir
export const getInStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stokda olan məhsulları gətirərkən xəta baş verdi',
      error: error.message
    });
  }
}; 