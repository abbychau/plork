import * as Minio from 'minio';

if (!process.env.MINIO_ENDPOINT) throw new Error('MINIO_ENDPOINT is required');
if (!process.env.MINIO_ACCESS_KEY) throw new Error('MINIO_ACCESS_KEY is required');
if (!process.env.MINIO_SECRET_KEY) throw new Error('MINIO_SECRET_KEY is required');
if (!process.env.MINIO_BUCKET_NAME) throw new Error('MINIO_BUCKET_NAME is required');
if (!process.env.MINIO_DOMAIN) throw new Error('MINIO_DOMAIN is required');

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '443'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;
export const DOMAIN = process.env.MINIO_DOMAIN;

// For temporary access (e.g., previews, temporary content)
export async function getTemporaryUrl(filePath: string): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, filePath);
}

// For permanent content (e.g., markdown posts)
export function getPermanentUrl(filePath: string): string {
  return `${DOMAIN}/${BUCKET_NAME}/${filePath}`;
}

export async function uploadFile(buffer: Buffer, filePath: string, isPermanent: boolean = false): Promise<string> {
  await minioClient.putObject(BUCKET_NAME, filePath, buffer);
  return isPermanent ? getPermanentUrl(filePath) : await getTemporaryUrl(filePath);
}

export async function deleteFile(filePath: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, filePath);
}

export function extractImageUrlsFromContent(content: string): string[] {
  const imageUrls: string[] = [];
  const domain = DOMAIN;
  const bucketName = BUCKET_NAME;
  
  // Match both markdown images and HTML img tags that reference our Minio domain
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
  const htmlImageRegex = /<img[^>]+src="([^"]+)"/g;
  
  // Extract from markdown format
  let match;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.includes(domain) && url.includes(bucketName)) {
      imageUrls.push(url);
    }
  }
  
  // Extract from HTML format
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.includes(domain) && url.includes(bucketName)) {
      imageUrls.push(url);
    }
  }
  
  return imageUrls;
}

export function getFilePathFromUrl(url: string): string | null {
  try {
    const domain = DOMAIN;
    const bucketName = BUCKET_NAME;
    
    // Handle both http:// and https:// URLs
    const urlPattern = new RegExp(`^https?://${domain.replace(/^https?:\/\//, '')}/${bucketName}/(.+)$`);
    const match = url.match(urlPattern);
    
    if (match && match[1]) {
      return match[1]; // Return the file path without domain and bucket
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
} 