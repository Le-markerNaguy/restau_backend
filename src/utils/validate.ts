import Joi from "joi";


export const dishSchema = Joi.object({
name: Joi.string().min(2).max(100).required(),
description: Joi.string().allow("").max(500),
price: Joi.number().precision(2).positive().required(),
category: Joi.string().valid("ENTREE", "PLAT", "DESSERT", "BOISSON").required(),
available: Joi.boolean().default(true)
});


export const tableSchema = Joi.object({
number: Joi.number().integer().min(1).required()
});


export const orderSchema = Joi.object({
tableId: Joi.number().integer().required(),
items: Joi.array().items(
Joi.object({
dishId: Joi.number().integer().required(),
quantity: Joi.number().integer().min(1).required()
})
).min(1).required()
});