import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';

// JWT token yaratmaq üçün köməkçi funksiya
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Qeydiyyat
export const register = async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validasiya
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'İstifadəçi adı və şifrə məcburidir'
      });
    }

    // İstifadəçi mövcudluğunu yoxla
    const userExists = await User.findOne({ name });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu istifadəçi adı artıq mövcuddur'
      });
    }

    const user = await User.create({
      name: name.trim(),
      password
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xətası',
      error: error.message
    });
  }
};


export const login = async (req, res) => {
  try {
    const { name, password } = req.body;

  
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'İstifadəçi adı və ya şifrə səhvdir'
      });
    }

    // Şifrəni yoxla
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'İstifadəçi adı və ya şifrə səhvdir'
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xətası',
      error: error.message
    });
  }
};

// Admin yaratmaq üçün funksiya
export const createAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'İstifadəçi adı və şifrə məcburidir'
      });
    }

    // Admin mövcudluğunu yoxla
    const adminExists = await User.findOne({ name: name.trim() });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin artıq mövcuddur'
      });
    }

    // Admin yarat
    const admin = await User.create({
      name: name.trim(),
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin uğurla yaradıldı',
      admin: {
        id: admin._id,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin yaradılarkən xəta baş verdi',
      error: error.message
    });
  }
};

// Bütün istifadəçiləri gətir (only admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstifadəçiləri gətirərkən xəta baş verdi',
      error: error.message
    });
  }
};

// İstifadəçini sil (only admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'İstifadəçi tapılmadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'İstifadəçi uğurla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstifadəçi silinərkən xəta baş verdi',
      error: error.message
    });
  }
}; 

