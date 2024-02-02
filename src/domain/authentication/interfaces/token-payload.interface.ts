import { UserAuthority } from '../../users/entities/user-authority.entity';

interface TokenPayload {
  userId: string;
  authorities?: UserAuthority[];
}
export default TokenPayload;
