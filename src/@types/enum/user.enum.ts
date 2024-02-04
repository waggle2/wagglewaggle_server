export enum AuthenticationProvider {
  KAKAO = 'kakao',
  NAVER = 'naver',
  GOOGLE = 'google',
  EMAIL = 'email',
}

export enum AuthorityName {
  USER = 'user',
  ADMIN = 'admin',
}

export enum State {
  JOINED = '가입',
  WITHDRAWN = '탈퇴',
}

export enum Gender {
  MALE = '남성',
  FEMALE = '여성',
}

export enum ExitReasonEnum {
  Not_USED = '자주 사용하지 않아요',
  SERVICE_ERROR = '서비스 오류가 있어요',
  NOT_LIKED_BY_FRIENDS = '친구들이 마음에 들지 않아요',
  OTHER = '기타',
}
