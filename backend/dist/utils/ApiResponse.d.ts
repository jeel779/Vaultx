declare class ApiResponse<T> {
    statusCode: number;
    data: T;
    success: boolean;
    message: string;
    constructor(statusCode: number, data: T, message?: string);
}
export { ApiResponse };
//# sourceMappingURL=ApiResponse.d.ts.map