import { MigrationInterface, QueryRunner } from 'typeorm';

export class ItemTypeEnumRefactoring1710410177498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE items
            MODIFY COLUMN item_type ENUM('emoji', 'background', 'frame', 'wallpaper', '이모지', '프로필 배경', '프레임', '벽지')
    `);

    await queryRunner.query(`
        UPDATE items
        SET
            item_type =
                CASE
                    WHEN item_type = 'emoji' THEN '이모지'
                    WHEN item_type = 'background' THEN '프로필 배경'
                    WHEN item_type = 'frame' THEN '프레임'
                    WHEN item_type = 'wallpaper' THEN '벽지'
                    ELSE item_type
                END
    `);

    await queryRunner.query(`
        ALTER TABLE items
            MODIFY COLUMN item_type ENUM('이모지', '프로필 배경', '프레임', '벽지')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE items
            MODIFY COLUMN item_type ENUM('이모지', '프로필 배경', '프레임', '벽지', 'emoji', 'background', 'frame', 'wallpaper')
    `);

    await queryRunner.query(`
        UPDATE items
        SET
            item_type =
                CASE
                    WHEN item_type = '이모지' THEN 'emoji'
                    WHEN item_type = '프로필 배경' THEN 'background'
                    WHEN item_type = '프레임' THEN 'frame'
                    WHEN item_type = '벽지' THEN 'wallpaper'
                    ELSE item_type
                END
    `);

    await queryRunner.query(`
        ALTER TABLE items
            MODIFY COLUMN primary_animal ENUM('emoji', 'background', 'frame', 'wallpaper')
    `);
  }
}
