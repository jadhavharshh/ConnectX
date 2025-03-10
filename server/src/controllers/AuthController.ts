import { Request, Response, NextFunction } from "express";

export const GET_SIGNUP_DATA = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("IN THE SIGN UP FUNCTION");
        
    } catch (error) {
        next(error);
    }
};