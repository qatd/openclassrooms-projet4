import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error';

// Centralized error handling: every error thrown in a route ends up here.
// Express recognizes an error middleware by its 4 parameters, so `_next` must stay.
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // Expected error thrown on purpose (400, 401, 403, 404...)
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Invalid JSON body, rejected by express.json()
  if (err instanceof SyntaxError) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  // Unexpected error: log the details, send a generic message to the client
  console.error(`${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ message: 'Internal server error' });
};
