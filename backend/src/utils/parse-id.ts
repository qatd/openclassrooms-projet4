import { HttpError } from '../errors/http-error';

// Reads a numeric id from a route parameter, e.g. parseId('12', 'Session') returns 12
export const parseId = (value: string | undefined, label: 'Session' | 'User' | 'Teacher'): number => {
  if (!value) {
    throw new HttpError(400, `${label} ID is required`);
  }

  const id = parseInt(value);

  if (isNaN(id)) {
    throw new HttpError(400, `Invalid ${label.toLowerCase()} ID`);
  }

  return id;
};
