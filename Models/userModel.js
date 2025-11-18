import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad tələb olunur'],
    unique: true,
    trim: true,
    minLength: [2, 'Ad minimum 2 simvol olmalıdır'],
    maxLength: [50, 'Ad maksimum 50 simvol ola bilər']
  },
  password: {
    type: String,
    required: [true, 'Şifrə tələb olunur'],
    minLength: [6, 'Şifrə minimum 6 simvol olmalıdır']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User; 