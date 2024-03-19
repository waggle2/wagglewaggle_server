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
  // 400
  NOT_POLLED = '2000',

  // 403
  AUTHOR_DIFFERENT_USER = '2030',
  DUPLICATE_VOTE = '2031',
  POLL_ENDED = '2032',

  // 404
  POLL_NOT_FOUND = '2040',
  POLL_ITEM_NOT_FOUND = '2041',

  // 409
  POLL_CONFLICT = '2090',
  ALREADY_VOTE = '2091',
  POLL_ALREADY_EXISTS = '2092',
}

export enum StickerExceptionEnum {
  // 403
  DIFFERENT_USER = '3030',

  // 404
  STICKER_NOT_FOUND = '3040',

  // 409
  ALREADY_STICKER = '3090',
}

export enum AuthExceptionEnum {
  USER_UNAUTHORIZED = '4010',
  NEED_SELF_VERIFICATION = '4011',
  USER_FORBIDDEN = '4030',
  SOCIAL_LOGIN_FORBIDDEN = '4031',
  REPORT_FORBIDDEN = '4032',
  BLOCK_FORBIDDEN = '4033',
  NOT_ADULT = '4034',
}

export enum UserExceptionEnum {
  USER_BAD_REQUEST = '5000',
  USER_NOT_FOUND = '5010',
}

export enum ItemExceptionEnum {
  ITEM_BAD_REQUEST = '6000',
  ITEM_NOT_FOUND = '6010',
}

export enum LikeExceptionEnum {
  // 403
  DIFFERENT_USER = '7030',

  // 409
  ALREADY_LIKE = '7090',
}

export enum MessageExceptionEnum {
  MESSAGE_BAD_REQUEST = '8000',
  MESSAGE_NOT_FOUND = '8010',
  MESSAGEROOM_NOT_FOUND = '8011',
}

export enum SearchHistoryExceptionEnum {
  DIFFERENT_USER = '7030',
}

export enum FeedbackExceptionEnum {
  NOT_ADMIN_NO_PERMISSION = '8030',
  FEEDBACK_NOT_FOUND = '8040',
}

export enum BlockExceptionEnum {
  BLOCK_BAD_REQUEST = '9000',
  BLOCK_NOT_FOUND = '9010',
}
