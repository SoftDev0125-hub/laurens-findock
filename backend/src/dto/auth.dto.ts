import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional, IsArray } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  firstName!: string;

  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  lastName!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}

