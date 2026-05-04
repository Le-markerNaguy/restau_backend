"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = saveImage;
exports.deleteImage = deleteImage;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
/**
 * Sauvegarde un fichier image et retourne l'URL
 */
async function saveImage(file) {
    if (!file)
        return null;
    try {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${timestamp}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        // Écrire le fichier
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));
        // Retourner l'URL
        return `/uploads/${filename}`;
    }
    catch (error) {
        console.error("Erreur lors de la sauvegarde de l'image:", error);
        return null;
    }
}
/**
 * Supprime un fichier image
 */
async function deleteImage(imageUrl) {
    if (!imageUrl)
        return;
    try {
        // Extraire le nom du fichier depuis l'URL
        const filename = imageUrl.split("/").pop();
        if (!filename)
            return;
        const filepath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }
    catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
    }
}
