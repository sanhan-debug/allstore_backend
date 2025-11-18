import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';

// İstifadəçinin autentifikasiyasını yoxlayır
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Giriş icazəniz yoxdur'
      });
    }

    // Token-i yoxla
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // İstifadəçini tap
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'İstifadəçi tapılmadı'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Giriş icazəniz yoxdur',
      error: error.message
    });
  }
};

// Admin rolunu yoxlayır
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin icazəsi tələb olunur'
    });
  }
}; 