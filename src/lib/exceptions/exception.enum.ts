export enum UncatchedExceptionEnum {
  UNCATCHED = '9999',
}

export enum PostExceptionEnum {
  POST_BAD_REQUEST = '0000',
  POST_NOT_FOUND = '0004',
}

export enum CommentExceptionEnum {
  COMMENT_BAD_REQUEST = '1000',
  COMMENT_NOT_FOUND = '1004',
}

export enum PollExceptionEnum {
  POLL_NOT_FOUND = '2001',
  POLL_CONFLICT = '2002',
}

export enum StickerExceptionEnum {
  STICKER_NOT_FOUND = '3001',
}

export enum AuthExceptionEnum {
  USER_UNAUTHORIZED = '4001',
  SOCIAL_LOGIN_FORBIDDEN = '4003',
}

export enum UserExceptionEnum {
  USER_NOT_FOUND = '5001',
  USER_BAD_REQUEST = '5000',
}
