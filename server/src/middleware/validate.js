import { HttpError } from './error.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const data = req[source];
  const result = schema.safeParse(data);
  if (!result.success) {
    return next(new HttpError(400, 'Validation failed', result.error.flatten()));
  }
  req[source] = result.data;
  next();
};
