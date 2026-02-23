import imageCompression from "browser-image-compression";

/**
 * Compresses an image and converts it to Base64 string.
 * Returns Base64 Data URL for direct storage in Firestore.
 *
 * @param file   - The raw File object from an <input type="file">.
 * @param folder - The folder name for reference (used only for logging).
 * @returns      - The Base64 Data URL of the compressed image.
 */
export async function uploadImageToStorage(
    file: File,
    folder: string,
    options?: {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
        initialQuality?: number;
    }
): Promise<string> {
    try {
        // 1. Compress image client-side
        const compressedFile = await imageCompression(file, {
            maxSizeMB: options?.maxSizeMB ?? 1,
            maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
            useWebWorker: true,
            initialQuality: options?.initialQuality ?? 0.8,
            fileType: "image/webp",
        });

        // 2. Convert to Base64 Data URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                if (base64String) {
                    console.log(`✅ Image compressed and converted to Base64 for ${folder}`);
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to convert image to Base64"));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read image file"));
            reader.readAsDataURL(compressedFile);
        });
    } catch (error) {
        console.error(`❌ Error processing image for ${folder}:`, error);
        throw new Error("Failed to process image");
    }
}

/**
 * Converts video file to Base64 string (no compression for videos).
 * Returns Base64 Data URL for direct storage in Firestore.
 *
 * @param file   - The raw File object from an <input type="file">.
 * @param folder - The folder name for reference (used only for logging).
 * @returns      - The Base64 Data URL of the video.
 */
export async function uploadVideoToStorage(
    file: File,
    folder: string
): Promise<string> {
    try {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                if (base64String) {
                    console.log(`✅ Video converted to Base64 for ${folder}`);
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to convert video to Base64"));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read video file"));
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error(`❌ Error processing video for ${folder}:`, error);
        throw new Error("Failed to process video");
    }
}
