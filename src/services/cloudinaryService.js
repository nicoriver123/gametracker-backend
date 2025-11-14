import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir imagen
export const uploadImage = async (filePath, folder = 'gametracker/juegos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      max_bytes: 5242880 // 5MB máximo
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    };
  } catch (error) {
    console.error('❌ Error al subir imagen a Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para eliminar imagen
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      message: 'Imagen eliminada correctamente'
    };
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para obtener URL optimizada
export const getOptimizedUrl = (publicId, width = 300, height = 400) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

export default cloudinary;
