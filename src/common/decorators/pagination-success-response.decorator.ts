import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { makeInstanceByApiProperty } from '@/common/utils/makeInstnaceByApiProperty';

interface SuccessResponseOption {
  /**
   * 응답 디티오를 인자로 받습니다
   * PageDto
   */
  model: Type;
  /**
   * 성공 메시지를 적습니다
   */
  message: string;
  /**
   * 제네릭이 필요할 때 기술합니다
   * pageDto<generic>
   */
  generic?: Type;
}

export const PaginationSuccessResponse = (
  statusCode: HttpStatus,
  successResponseOption: SuccessResponseOption,
) => {
  const dtoModel = successResponseOption.model;
  const example = makeInstanceByApiProperty<typeof dtoModel>(
    successResponseOption.model,
    successResponseOption.generic,
  );

  return applyDecorators(
    ApiResponse({
      status: statusCode,
      content: {
        'application/json': {
          example: {
            code: statusCode,
            message: successResponseOption.message,
            ...example,
          },
        },
      },
    }),
  );
};
