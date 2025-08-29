import QRCode from "qrcode";

/**
 * Construit l'URL de commande pour une table spécifique
 * @param tableNumber numéro de la table
 * @returns URL complète pour passer commande
 */
export function buildTableUrl(tableNumber: number): string {
  let frontend = process.env.FRONTEND_URL ?? "http://localhost:5173";

  // Si FRONTEND_URL contient plusieurs URLs séparées par des virgules, prendre la première
  if (frontend.includes(",")) {
    frontend = frontend.split(",")[0]?.trim() ?? frontend;
  }

  try {
    // Vérifier que l'URL est valide
    const url = new URL(frontend);
    url.pathname = "/order";
    url.searchParams.set("table", String(tableNumber));
    return url.toString();
  } catch (error) {
    console.error("Erreur lors de la construction de l'URL:", error);
    console.error("FRONTEND_URL invalide:", frontend);
    // Fallback vers une URL par défaut
    return `http://localhost:5173/order?table=${tableNumber}`;
  }
}

/**
 * Génère un QR code en Data URL à partir d'un texte ou URL
 * @param text texte ou URL à encoder
 * @returns Data URL du QR code (base64)
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, { margin: 1, scale: 6 });
  } catch (error) {
    console.error("Erreur lors de la génération du QR Code:", error);
    throw new Error("Impossible de générer le QR Code");
  }
}
