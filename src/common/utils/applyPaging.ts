import { SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

export const applyPaging = async (
  queryBuilder: SelectQueryBuilder<any>,
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
