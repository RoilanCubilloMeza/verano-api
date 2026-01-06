import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: File,
  folder: string = 'vehicles'
): Promise<{ url: string; publicId: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed'));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    throw new Error(`Error uploading image: ${error}`);
  }
}

export async function uploadPDF(
  file: File,
  folder: string = 'vehicles/pdfs'
): Promise<{ url: string; publicId: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generar un nombre único con extensión .pdf
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}`;
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'raw',
            type: 'upload', // Tipo de upload público
            public_id: fileName,
            format: 'pdf',
            invalidate: true, // Invalidar caché CDN
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed'));
            } else {
              // Usar la URL que Cloudinary proporciona directamente
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    throw new Error(`Error uploading PDF: ${error}`);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export async function deletePDF(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting PDF:', error);
  }
}

export default cloudinary;
