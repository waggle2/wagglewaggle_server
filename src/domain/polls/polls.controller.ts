import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Poll } from '@/domain/polls/entities/poll.entity';
import {
  AlreadyVoteException,
  PollConflictException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { PollItemsService } from '@/domain/pollItems/pollItems.service';
import { PollItem } from '@/domain/pollItems/entities/pollItem.entity';

@Controller('polls')
@ApiTags('polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly pollItemsService: PollItemsService,
  ) {}

  @ApiOperation({ summary: '투표 생성' })
  @ApiCreatedResponse({
    type: Poll,
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
    return await this.pollsService.create(user, +postId, createPollDto);
  }

  @ApiOperation({ summary: '투표' })
  @ApiOkResponse({
    type: PollItem,
  })
  @ApiConflictResponse({
    type: AlreadyVoteException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/poll-items/:pollItemId')
  async vote(
    @Req() req: RequestWithUser,
    @Param('pollItemId') pollItemId: string,
  ) {
    const { user } = req;
    return await this.pollItemsService.vote(user, +pollItemId);
  }

  @ApiOperation({ summary: '투표 수정' })
  @ApiOkResponse({
    type: Poll,
  })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '해당 투표가 존재하지 않습니다',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
  ) {
    const { user } = req;
    return await this.pollsService.update(user, +id, updatePollDto);
  }

  @ApiOperation({ summary: '투표 항목 여러 개 삭제' })
  @ApiOkResponse({ type: String, description: '성공적으로 삭제되었습니다' })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '해당 투표가 존재하지 않습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete('/poll-items')
  async removePollItems(
    @Req() req: RequestWithUser,
    @Query('ids') ids: string[],
  ) {
    const { user } = req;
    const idsNum = ids.map((id) => +id);

    await this.pollItemsService.removeMultiple(user, idsNum);

    return { message: '성공적으로 삭제되었습니다.' };
  }

  @ApiOperation({ summary: '투표 삭제' })
  @ApiOkResponse({ type: String, description: '성공적으로 삭제되었습니다' })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '해당 투표가 존재하지 않습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.pollsService.remove(user, +id);
    return { message: '성공적으로 삭제되었습니다.' };
  }
}
