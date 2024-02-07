export enum UncatchedExceptionEnum {
  UNCATCHED = '9999',
}

export enum PostExceptionEnum {
  // 400
  POST_BAD_REQUEST = '0000',
  POST_ALREADY_DELETED = '0001',

  // 403
  AUTHOR_DIFFERENT_USER = '0030',

  // 404
  POST_NOT_FOUND = '0040',
}

export enum CommentExceptionEnum {
  // 400
  COMMENT_BAD_REQUEST = '1000',
  COMMENT_ALREADY_DELETED = '1001',

  // 403
  AUTHOR_DIFFERENT_USER = '1030',

  // 404
  COMMENT_NOT_FOUND = '1004',
}

export enum PollExceptionEnum {
  // 403
  AUTHOR_DIFFERENT_USER = '2030',

  // 404
  POLL_NOT_FOUND = '2040',

  // 409
  POLL_CONFLICT = '2090',
  ALREADY_VOTE = '2091',
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

export enum LikeExceptionEnum {
  // 403
  DIFFERENT_USER = '6030',

  // 409
  ALREADY_LIKE = '6090',
}

export enum StickerExceptionEnum {
  // 403
  DIFFERENT_USER = '7030',

  // 409
  ALREADY_STICKER = '7090',
}
