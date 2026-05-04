"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToSupabase = uploadImageToSupabase;
exports.deleteImageFromSupabase = deleteImageFromSupabase;
exports.checkSupabaseConnection = checkSupabaseConnection;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const bucketName = "dish-images";
if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Supabase credentials not set in environment variables");
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/**
 * Sauvegarde une image dans Supabase Storage
 */
async function uploadImageToSupabase(file) {
    try {
        const timestamp = Date.now();
        const ext = file.originalname.split(".").pop() || "jpg";
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(`dishes/${filename}`, new Uint8Array(file.buffer), {
            contentType: file.mimetype,
        });
        if (error) {
            console.error("Erreur upload Supabase:", error);
            return null;
        }
        // Retourner l'URL publique
        const { data: { publicUrl }, } = supabase.storage.from(bucketName).getPublicUrl(`dishes/${filename}`);
        return publicUrl;
    }
    catch (error) {
        console.error("Erreur lors de l'upload Supabase:", error);
        return null;
    }
}
/**
 * Supprime une image de Supabase Storage
 */
async function deleteImageFromSupabase(imageUrl) {
    if (!imageUrl)
        return;
    try {
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        if (!filename)
            return;
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([`dishes/${filename}`]);
        if (error) {
            console.error("Erreur suppression Supabase:", error);
        }
    }
    catch (error) {
        console.error("Erreur lors de la suppression Supabase:", error);
    }
}
/**
 * Vérifie la connexion à Supabase
 */
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error("❌ Connexion Supabase échouée:", error);
            return false;
        }
        console.log("✅ Supabase Storage connecté");
        return true;
    }
    catch (error) {
        console.error("❌ Erreur vérification Supabase:", error);
        return false;
    }
}
