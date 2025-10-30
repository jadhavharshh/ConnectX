"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const AuthRoutes = (0, express_1.Router)();
AuthRoutes.post('/send-signup-data', AuthController_1.STORE_SIGNUP_DATA);
exports.default = AuthRoutes;
