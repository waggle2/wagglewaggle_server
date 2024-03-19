import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AlreadyVoteException,
  DuplicateVoteForbiddenException,
  NotPolledException,
  PollAuthorDifferentException,
  PollConflictException,
  PollEndedException,
  PollItemNotFoundException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { HttpResponse } from '@/@types/http-response';
import { PollResponseDto } from '@/domain/polls/dto/poll-response.dto';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';

@Controller('polls')
@ApiTags('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @ApiOperation({ summary: '투표 생성' })
  @ApiResponse({
    status: 201,
    description: '투표 생성 성공',
    type: PollResponseDto,
  })
  @ApiUnauthorizedResponse({
    type: PollAuthorDifferentException,
    description: '해당 게시물의 작성자가 아닌 경우입니다',
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '존재하지 않는 게시물입니다',
  })
  @ApiConflictResponse({
    type: PollConflictException,
    description: '이미 투표 항목이 존재하는 게시글입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':postId')
  async create(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
    @Body() createPollDto: CreatePollDto,
  ) {
    const { user } = req;
    const poll = await this.pollsService.create(user, +postId, createPollDto);
    return HttpResponse.created(
      '투표 생성 성공',
      new PollResponseDto(poll, poll.post.id),
    );
  }

  @ApiOperation({ summary: '투표' })
  @ApiOkResponse({
    type: PollResponseDto,
    description: '투표 성공',
  })
  @ApiForbiddenResponse({
    type: PollEndedException,
    description: '투표가 마감되었습니다.',
  })
  @ApiForbiddenResponse({
    type: DuplicateVoteForbiddenException,
    description: '한 항목에만 투표할 수 있습니다',
  })
  @ApiNotFoundResponse({
    type: PollItemNotFoundException,
    description: '해당 투표 항목이 존재하지 않습니다',
  })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '투표 요청 중에 투표가 삭제된 경우',
  })
  @ApiConflictResponse({
    type: AlreadyVoteException,
    description: '이미 투표한 항목입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/poll-items/:pollItemId')
  async vote(
    @Req() req: RequestWithUser,
    @Param('pollItemId') pollItemId: string,
  ) {
    const { user } = req;
    const poll = await this.pollsService.vote(user, +pollItemId);
    return HttpResponse.success(
      '투표 성공',
      new PollResponseDto(poll, poll.post.id),
    );
  }

  @ApiOperation({ summary: '재투표' })
  @ApiOkResponse({
    type: PollResponseDto,
    description: '재투표 성공',
  })
  @ApiBadRequestResponse({
    type: NotPolledException,
    description: '투표하지 않은 투표입니다. 재투표 대상이 아닙니다.',
  })
  @ApiForbiddenResponse({
    type: PollConflictException,
    description: '투표가 마감된 경우',
  })
  @ApiForbiddenResponse({
    type: DuplicateVoteForbiddenException,
    description: '한 항목에만 투표할 수 있습니다',
  })
  @ApiNotFoundResponse({
    type: PollItemNotFoundException,
    description: '해당 투표 항목이 존재하지 않습니다',
  })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '투표 요청 중에 투표가 삭제된 경우',
  })
  @ApiConflictResponse({
    type: AlreadyVoteException,
    description: '이미 투표한 항목입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch('/poll-items/:pollItemId')
  async updateVote(
    @Req() req: RequestWithUser,
    @Param('pollItemId') pollItemId: string,
  ) {
    const { user } = req;
    const poll = await this.pollsService.updateVote(user, +pollItemId);
    return HttpResponse.success(
      '재투표 성공',
      new PollResponseDto(poll, poll.post.id),
    );
  }

  @ApiOperation({ summary: '투표 삭제' })
  @ApiResponse({
    status: 200,
    description: '삭제 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '성공적으로 삭제되었습니다' },
      },
    },
  })
  @ApiForbiddenResponse({
    type: PollAuthorDifferentException,
    description: '투표 작성자와 다른 유저인 경우',
  })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '해당 투표가 존재하지 않습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.pollsService.remove(user, +id);
    return HttpResponse.success('성공적으로 삭제되었습니다.');
  }
}
