/**
 * HTTP Signature utilities for ActivityPub
 */
import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Sign a request for ActivityPub
export async function signRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  privateKey: string,
  keyId: string
): Promise<Record<string, string>> {
  const date = new Date().toUTCString();
  const parsedUrl = new URL(url);
  const path = `${parsedUrl.pathname}${parsedUrl.search}`;
  
  // Add date header
  headers['date'] = date;
  
  // Create the signature string
  const signatureString = `(request-target): ${method.toLowerCase()} ${path}\nhost: ${parsedUrl.host}\ndate: ${date}`;
  
  // Sign the string
  const signer = crypto.createSign('sha256');
  signer.update(signatureString);
  signer.end();
  const signature = signer.sign(privateKey, 'base64');
  
  // Create the signature header
  const signatureHeader = `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) host date",signature="${signature}"`;
  
  // Add the signature header
  headers['signature'] = signatureHeader;
  
  return headers;
}

// Verify a signature from an incoming request
export async function verifySignature(
  req: NextRequest,
  publicKey: string
): Promise<boolean> {
  try {
    const signature = req.headers.get('signature');
    const date = req.headers.get('date');
    const host = req.headers.get('host');
    const method = req.method.toLowerCase();
    const url = new URL(req.url);
    const path = `${url.pathname}${url.search}`;
    
    if (!signature || !date || !host) {
      return false;
    }
    
    // Parse the signature header
    const signatureParams: Record<string, string> = {};
    signature.split(',').forEach((part) => {
      const [key, value] = part.split('=');
      signatureParams[key.trim()] = value.replace(/^"/, '').replace(/"$/, '');
    });
    
    const { headers: signedHeaders, signature: signatureValue } = signatureParams;
    
    // Recreate the signature string
    let signatureString = '';
    signedHeaders.split(' ').forEach((header) => {
      if (header === '(request-target)') {
        signatureString += `(request-target): ${method} ${path}\n`;
      } else if (header === 'host') {
        signatureString += `host: ${host}\n`;
      } else if (header === 'date') {
        signatureString += `date: ${date}\n`;
      }
    });
    
    // Remove the last newline
    signatureString = signatureString.slice(0, -1);
    
    // Verify the signature
    const verifier = crypto.createVerify('sha256');
    verifier.update(signatureString);
    verifier.end();
    
    return verifier.verify(publicKey, signatureValue, 'base64');
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
