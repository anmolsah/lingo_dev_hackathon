import pdf from 'pdf-parse';
import fs from 'fs';

export async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromImage(filePath) {
    // Placeholder for OCR functionality
    // In production, integrate with Tesseract.js or Google Vision API
    throw new Error('Image OCR not yet implemented');
}
