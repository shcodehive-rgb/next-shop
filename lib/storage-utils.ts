import imageCompression from "browser-image-compression";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Compresses an image and uploads it to Firebase Storage.
 * Returns the public download URL — NOT a Base64 string.
 *
 * @param file   - The raw File object from an <input type="file">.
 * @param folder - The Storage folder to place the file in (e.g. "banners", "products").
 * @returns      - The HTTPS download URL of the uploaded file.
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
    // 1. Compress the image client-side
    const compressedFile = await imageCompression(file, {
        maxSizeMB: options?.maxSizeMB ?? 1,
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        useWebWorker: true,
        initialQuality: options?.initialQuality ?? 0.8,
        fileType: "image/webp",
    });

    // 2. Build a unique path in Storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageRef = ref(storage, `${folder}/${timestamp}_${safeName}`);

    // 3. Upload the compressed file
    await uploadBytes(storageRef, compressedFile);

    // 4. Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
