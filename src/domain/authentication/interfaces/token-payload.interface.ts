import { UserAuthority } from '../../users/entities/user-authority.entity';

interface TokenPayload {
  id: string;
  authorities?: UserAuthority[];
}
export default TokenPayload;
