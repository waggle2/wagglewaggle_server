import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
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
  PollConflictException,
  PollNotFoundException,
} from '@/lib/exceptions/domain/polls.exception';

@Controller('polls')
@ApiTags('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @ApiOperation({ summary: '투표 전체 조회' })
  @Get()
  async findAll() {
    return await this.pollsService.findAll();
  }

  @ApiOperation({ summary: '투표 생성' })
  @ApiCreatedResponse({
    type: Poll,
  })
  @ApiConflictResponse({
    type: PollConflictException,
    description: '이미 투표 항목이 존재하는 게시글입니다',
  })
  @Post(':postId')
  async create(
    @Param('postId') postId: string,
    @Body() createPollDto: CreatePollDto,
  ) {
    return await this.pollsService.create(+postId, createPollDto);
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
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
    return await this.pollsService.update(+id, updatePollDto);
  }

  @ApiOperation({ summary: '투표 삭제' })
  @ApiOkResponse({ type: String, description: '성공적으로 삭제되었습니다' })
  @ApiNotFoundResponse({
    type: PollNotFoundException,
    description: '해당 투표가 존재하지 않습니다',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pollsService.remove(+id);
    return { message: '성공적으로 삭제되었습니다.' };
  }
}
