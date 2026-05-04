"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.tableSchema = exports.dishSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.dishSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().allow("").max(500),
    price: joi_1.default.number().precision(2).positive().required(),
    category: joi_1.default.string().valid("ENTREE", "PLAT", "DESSERT", "BOISSON").required(),
    available: joi_1.default.boolean().default(true)
});
exports.tableSchema = joi_1.default.object({
    number: joi_1.default.number().integer().min(1).required()
});
exports.orderSchema = joi_1.default.object({
    tableId: joi_1.default.number().integer().required(),
    items: joi_1.default.array().items(joi_1.default.object({
        dishId: joi_1.default.number().integer().required(),
        quantity: joi_1.default.number().integer().min(1).required()
    })).min(1).required()
});
