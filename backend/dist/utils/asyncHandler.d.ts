import type { NextFunction, Request, Response } from "express";
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any> | any;
declare const asyncHandler: (requestHandler: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler };
//# sourceMappingURL=asyncHandler.d.ts.map