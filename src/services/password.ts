import bcrypt from "bcryptjs";

/**
 * Hash un mot de passe en utilisant bcrypt
 * @param plain mot de passe en clair
 * @returns hash du mot de passe
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Vérifie qu'un mot de passe correspond au hash stocké
 * @param plain mot de passe en clair
 * @param hash hash stocké dans la base
 * @returns true si le mot de passe correspond, false sinon
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
