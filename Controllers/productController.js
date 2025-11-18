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

// Tək məhsulu gətir
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
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

    const { name, price, category, imageUrl, description, inStock, isWeightBased, pricePerKg } = req.body;

    // Məcburi sahələri yoxla
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Ad, qiymət və kateqoriya məcburidir'
      });
    }

    // Qiymətin düzgün format olduğunu yoxla
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Qiymət düzgün formatda deyil'
      });
    }

    // Kateqoriyanın düzgün olduğunu yoxla (Frontend ilə uyğunlaşdırılmış)
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
      price: Number(price),
      category,
      imageUrl: imageUrl || '',
      description: description?.trim() || '',
      inStock: inStock ?? true,
      isWeightBased: isWeightBased ?? false,
      pricePerKg: isWeightBased && pricePerKg ? Number(pricePerKg) : 0
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
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const products = await Product.find({ category: req.params.category });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
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