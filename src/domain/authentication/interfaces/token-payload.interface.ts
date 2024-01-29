import { UserAuthority } from '../../users/entities/user-authority.entity';

interface TokenPayload {
  userId: number;
  authorities?: UserAuthority[];
}
export default TokenPayload;
