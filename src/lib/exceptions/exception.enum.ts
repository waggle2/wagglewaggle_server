export enum UncatchedExceptionEnum {
  UNCATCHED = '9999',
}

export enum PostExceptionEnum {
  // 400
  POST_BAD_REQUEST = '0000',

  // 403
  AUTHOR_DIFFERENT_USER = '0030',

  // 404
  POST_NOT_FOUND = '0040',
}

export enum CommentExceptionEnum {
  // 400
  COMMENT_BAD_REQUEST = '1000',

  // 403
  AUTHOR_DIFFERENT_USER = '1030',

  // 404
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
