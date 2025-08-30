import multer from "multer";

// Stockage en mémoire pour envoi direct vers Supabase
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Seules les images JPG, PNG ou WEBP sont autorisées"));
    }
    cb(null, true);
  },
});
