import QRCode from "qrcode";

/**
 * Construit l'URL de commande pour une table spécifique
 * @param tableNumber numéro de la table
 * @returns URL complète pour passer commande
 */
export function buildTableUrl(tableNumber: number): string {
  const frontend = process.env.NEXT_PUBLIC_FRONTEND_URL;

  if (!frontend) {
    throw new Error(
      "⚠️ La variable d'environnement FRONTEND_URL n'est pas définie"
    );
  }

  try {
    // Si FRONTEND_URL contient plusieurs URLs séparées par des virgules, prendre la première
    const firstUrl = frontend.split(",")[0].trim();

    const url = new URL(firstUrl);
    url.pathname = "/order";
    url.searchParams.set("table", String(tableNumber));
    return url.toString();
  } catch (error) {
    console.error("Erreur lors de la construction de l'URL:", error);
    console.error("FRONTEND_URL invalide:", frontend);
    throw new Error("Impossible de construire l'URL de commande");
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
