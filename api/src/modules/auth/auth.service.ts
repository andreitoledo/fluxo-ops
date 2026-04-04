import { Injectable, NotImplementedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(_dto: LoginDto) {
    throw new NotImplementedException(
      'Login ainda nao foi implementado. Sera feito no proximo patch.',
    );
  }
}
