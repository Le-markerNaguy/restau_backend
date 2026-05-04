"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitOrderNew = emitOrderNew;
exports.emitOrderStatus = emitOrderStatus;
exports.emitOrderUpdate = emitOrderUpdate;
const websocket_1 = require("./websocket");
// Émettre une nouvelle commande aux admins
function emitOrderNew(orderDTO) {
    (0, websocket_1.getIo)().to("admins").emit("order:new", orderDTO);
}
// Émettre un changement de statut
function emitOrderStatus(orderDTO) {
    (0, websocket_1.getIo)().to("admins").emit("order:status", orderDTO);
}
// Émettre une mise à jour complète
function emitOrderUpdate(orderDTO) {
    (0, websocket_1.getIo)().to("admins").emit("order:update", orderDTO);
}
