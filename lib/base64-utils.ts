import imageCompression from "browser-image-compression";

/**
 * Compresses an image and converts it to a Base64 string for Firestore storage.
 * Ensures the result is well under Firestore's 1MB document limit.
 *
 * @param file   - The raw File object from an <input type="file">.
 * @param options - Compression options to control size and quality.
 * @returns      - Base64 string of the compressed image.
 */
export async function convertImageToBase64(
    file: File,
    options?: {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
        initialQuality?: number;
    }
): Promise<string> {
    // 1. Compress the image client-side to ensure it's under 1MB
    const compressedFile = await imageCompression(file, {
        maxSizeMB: options?.maxSizeMB ?? 0.5, // Conservative 0.5MB limit
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        useWebWorker: true,
        initialQuality: options?.initialQuality ?? 0.8,
        fileType: "image/webp", // WebP provides better compression
    });

    // 2. Convert compressed file to Base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix to get pure Base64
            const base64 = result.split(',')[1];
            resolve(result); // Return full data URL for direct img src usage
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
    });
}

/**
 * Validates if a Base64 string is within reasonable size limits for Firestore
 */
export function validateBase64Size(base64String: string): boolean {
    // Rough estimate: Base64 is ~33% larger than original binary
    const estimatedSizeBytes = (base64String.length * 3) / 4;
    const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
    return estimatedSizeMB < 0.8; // Keep under 0.8MB to be safe
}

/**
 * Checks if a string is a Base64 data URL
 */
export function isBase64DataUrl(url: string): boolean {
    return url.startsWith('data:image/');
}
