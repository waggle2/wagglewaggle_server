import { Controller, Req, Sse, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { map } from 'rxjs';
import { HttpResponse } from '@/@types/http-response';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('notifications')
@UseGuards(JwtAuthenticationGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: '알림 구독' })
  @ApiResponse({
    status: 200,
    description: 'SSE 연결 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: 'SSE 연결 성공' },
      },
    },
  })
  @Sse('stream')
  async stream(@Req() req: RequestWithUser) {
    const { user } = req;
    (await this.notificationService.getNotificationForUser(user.id)).pipe(
      map((data) => ({ data: JSON.stringify(data) })),
    );
    return HttpResponse.success('SSE 연결 성공');
  }
}
