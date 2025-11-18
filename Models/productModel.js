import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Məhsul adı məcburidir'],
    trim: true,
    minLength: [2, 'Məhsul adı minimum 2 simvol olmalıdır'],
    maxLength: [100, 'Məhsul adı maksimum 100 simvol ola bilər']
  },
  price: {
    type: Number,
    required: [true, 'Qiymət məcburidir'],
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
  description: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Əgər description boşdursa və ya undefined-dirsə, validasiyadan keç
        if (!v) return true;
        // Əks halda minimum uzunluğu yoxla
        return v.length >= 10;
      },
      message: 'Təsvir minimum 10 simvol olmalıdır'
    },
    maxLength: [1000, 'Təsvir maksimum 1000 simvol ola bilər']
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Məhsul yenilənəndə updatedAt sahəsini avtomatik yeniləyir
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 