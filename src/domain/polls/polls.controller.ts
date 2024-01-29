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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @Post(':postId')
  async create(
    @Param('postId') postId: string,
    @Body() createPollDto: CreatePollDto,
  ) {
    return await this.pollsService.create(+postId, createPollDto);
  }

  @ApiOperation({ summary: '투표 수정' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
    return await this.pollsService.update(+id, updatePollDto);
  }

  @ApiOperation({ summary: '투표 삭제' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removedPoll = this.pollsService.remove(+id);
    return { message: '성공적으로 삭제되었습니다.', removedPoll };
  }
}
