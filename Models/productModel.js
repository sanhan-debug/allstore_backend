import mongoose from 'mongoose';

// Slug yaratma funksiyası - bütün Azərbaycan hərflərini düzgün tərcümə edir
const createSlug = (text) => {
  // Azərbaycan hərflərinin ingilis hərflərinə tərcüməsi
  const azToEnMap = {
    'ə': 'e', 'Ə': 'e',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ğ': 'g', 'Ğ': 'g',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'ş': 'sh', 'Ş': 'sh',
    'ç': 'ch', 'Ç': 'ch'
  };

  return text
    .toString()
    .split('')
    .map(char => azToEnMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Məhsul adı məcburidir'],
    trim: true,
    minLength: [2, 'Məhsul adı minimum 2 simvol olmalıdır'],
    maxLength: [100, 'Məhsul adı maksimum 100 simvol ola bilər']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true
  },
  price: {
    type: Number,
    min: [0, 'Qiymət mənfi ola bilməz']
  },
  isWeightBased: {
    type: Boolean,
    default: false
  },
  pricePerKg: {
    type: Number,
    min: [0, 'Kq başına qiymət mənfi ola bilməz'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Kateqoriya məcburidir'],
    enum: [
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
    ],
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 3;
      },
      message: 'Maksimum 3 şəkil yüklənə bilər'
    }
  },
  isSized: {
    type: Boolean,
    default: false
  },
  sizeType: {
    type: String,
    enum: ['clothing', 'shoes', null],
    default: null
  },
  availableSizes: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxLength: [1000, 'Təsvir maksimum 1000 simvol ola bilər']
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Slug yaradılması və ya yenilənməsi
productSchema.pre('save', async function(next) {
  // Əgər slug yoxdursa və ya name dəyişibsə
  if (!this.slug || this.isModified('name')) {
    let baseSlug = createSlug(this.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Unikal slug tapmaq üçün
    const Product = this.constructor;
    while (await Product.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Çəki ilə satılır olsa, price-i avtomatik hesabla (1 qram üçün)
  if (this.isWeightBased && this.pricePerKg && !this.price) {
    this.price = this.pricePerKg / 1000;
  }
  
  // Çəki ilə satılır deyilsə və price varsa, pricePerKg-i null et
  if (!this.isWeightBased && this.price) {
    this.pricePerKg = 0;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Index slug üzərində (performans üçün)
productSchema.index({ slug: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product; 