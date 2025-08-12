import * as Joi from 'joi';

export const ConfigValidationSchema = Joi.object({
  PORT: Joi.number().default(8080),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  TMDB_API_KEY: Joi.string().required(),
});
