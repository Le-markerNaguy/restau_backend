"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Hash un mot de passe en utilisant bcrypt
 * @param plain mot de passe en clair
 * @returns hash du mot de passe
 */
async function hashPassword(plain) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(plain, salt);
}
/**
 * Vérifie qu'un mot de passe correspond au hash stocké
 * @param plain mot de passe en clair
 * @param hash hash stocké dans la base
 * @returns true si le mot de passe correspond, false sinon
 */
async function verifyPassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
