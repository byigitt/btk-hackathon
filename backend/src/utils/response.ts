export const createResponse = <T>(success: boolean, message: string, data: T | null = null) => ({
    success,
    message,
    data,
    timestamp: new Date().toISOString()
});

export const okResponse = <T>(message: string, data?: T) => createResponse(true, message, data);

export const errorResponse = (message: string) => createResponse(false, message);
