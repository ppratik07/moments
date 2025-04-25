// Extend the Request interface to include userId
export declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}