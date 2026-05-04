import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Sauvegarde un fichier image et retourne l'URL
 */
export async function saveImage(file: Express.Multer.File | undefined): Promise<string | null> {
  if (!file) return null;

  try {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Écrire le fichier
    fs.writeFileSync(filepath, new Uint8Array(file.buffer));

    // Retourner l'URL
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'image:", error);
    return null;
  }
}

/**
 * Supprime un fichier image
 */
export async function deleteImage(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl) return;

  try {
    // Extraire le nom du fichier depuis l'URL
    const filename = imageUrl.split("/").pop();
    if (!filename) return;

    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
  }
}
