import { SelectQueryBuilder } from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

export const applyPaging = async (
  queryBuilder: SelectQueryBuilder<Post>,
  pageOptionsDto: PageOptionsDto,
) => {
  const { page, pageSize } = pageOptionsDto;
  if (page && pageSize) {
    return await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  } else {
    return await queryBuilder.getManyAndCount();
  }
};
