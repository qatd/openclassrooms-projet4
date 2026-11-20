// Error with an HTTP status, thrown on purpose when a request can't be fulfilled
// (invalid input, not found, forbidden...). The error middleware turns it into a JSON response.
export class HttpError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}
