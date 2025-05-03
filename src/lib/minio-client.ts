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