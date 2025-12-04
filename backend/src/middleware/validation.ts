import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors: ValidationError[] = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }
        return 'Validation error';
      });

      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    req.body = dto;
    next();
  };
};

