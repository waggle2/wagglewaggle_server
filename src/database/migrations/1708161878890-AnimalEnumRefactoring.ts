import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnimalEnumRefactoring1708161878890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
            CHANGE COLUMN profile_anumal profile_animal ENUM('고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE users
            MODIFY COLUMN primary_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우'),
            MODIFY COLUMN second_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우'),
            MODIFY COLUMN profile_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE posts
            MODIFY COLUMN animal_of_author ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE item_cart
            MODIFY COLUMN animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        UPDATE users
        SET
            primary_animal =
                CASE
                    WHEN primary_animal = '고양이' THEN '고냥이'
                    WHEN primary_animal = '개' THEN '댕댕이'
                    WHEN primary_animal = '곰' THEN '곰돌이'
                    WHEN primary_animal = '여우' THEN '폭스'
                    ELSE primary_animal
                    END,
            second_animal =
                CASE
                    WHEN second_animal = '고양이' THEN '고냥이'
                    WHEN second_animal = '개' THEN '댕댕이'
                    WHEN second_animal = '곰' THEN '곰돌이'
                    WHEN second_animal = '여우' THEN '폭스'
                    ELSE second_animal
                    END,
            profile_animal =
                CASE
                    WHEN profile_animal = '고양이' THEN '고냥이'
                    WHEN profile_animal = '개' THEN '댕댕이'
                    WHEN profile_animal = '곰' THEN '곰돌이'
                    WHEN profile_animal = '여우' THEN '폭스'
                    ELSE profile_animal
                    END
    `);

    await queryRunner.query(`
        UPDATE posts
          SET
              animal_of_author =
                  CASE
                      WHEN animal_of_author = '고양이' THEN '고냥이'
                      WHEN animal_of_author = '개' THEN '댕댕이'
                      WHEN animal_of_author = '곰' THEN '곰돌이'
                      WHEN animal_of_author = '여우' THEN '폭스'
                      ELSE animal_of_author
                      END
    `);

    await queryRunner.query(`
        UPDATE item_cart
        SET
            animal =
                CASE
                    WHEN animal = '고양이' THEN '고냥이'
                    WHEN animal = '개' THEN '댕댕이'
                    WHEN animal = '곰' THEN '곰돌이'
                    WHEN animal = '여우' THEN '폭스'
                    ELSE animal
                    END
    `);

    await queryRunner.query(`
        ALTER TABLE users
            MODIFY COLUMN primary_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스'),
            MODIFY COLUMN second_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스'),
            MODIFY COLUMN profile_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스')
    `);

    await queryRunner.query(`
        ALTER TABLE posts
            MODIFY COLUMN animal_of_author ENUM('고냥이', '댕댕이', '곰돌이', '폭스')
    `);

    await queryRunner.query(`
        ALTER TABLE item_cart
            MODIFY COLUMN animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users
            CHANGE COLUMN profile_animal profile_anumal ENUM('고냥이', '댕댕이', '곰돌이', '폭스')
    `);

    await queryRunner.query(`
        ALTER TABLE users
            MODIFY COLUMN primary_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우'),
            MODIFY COLUMN second_animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우'),
            MODIFY COLUMN profile_anumal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE posts
            MODIFY COLUMN animal_of_author ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE item_cart
            MODIFY COLUMN animal ENUM('고냥이', '댕댕이', '곰돌이', '폭스', '고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        UPDATE users
        SET
            primary_animal =
                CASE
                    WHEN primary_animal = '고냥이' THEN '고양이'
                    WHEN primary_animal = '댕댕이' THEN '개'
                    WHEN primary_animal = '곰돌이' THEN '곰'
                    WHEN primary_animal = '폭스' THEN '여우'
                    ELSE primary_animal
                    END,
            second_animal =
                CASE
                    WHEN second_animal = '고냥이' THEN '고양이'
                    WHEN second_animal = '댕댕이' THEN '개'
                    WHEN second_animal = '곰돌이' THEN '곰'
                    WHEN second_animal = '폭스' THEN '여우'
                    ELSE second_animal
                    END,
            profile_anumal =
                CASE
                    WHEN profile_anumal = '고냥이' THEN '고양이'
                    WHEN profile_anumal = '댕댕이' THEN '개'
                    WHEN profile_anumal = '곰돌이' THEN '곰'
                    WHEN profile_anumal = '폭스' THEN '여우'
                    ELSE profile_anumal
                    END
    `);

    await queryRunner.query(`
        UPDATE posts
        SET
            animal_of_author =
                CASE
                    WHEN animal_of_author = '고냥이' THEN '고양이'
                    WHEN animal_of_author = '댕댕이' THEN '개'
                    WHEN animal_of_author = '곰돌이' THEN '곰'
                    WHEN animal_of_author = '폭스' THEN '여우'
                    ELSE animal_of_author
                    END
    `);

    await queryRunner.query(`
        UPDATE item_cart
        SET
            animal =
                CASE
                    WHEN animal = '고냥이' THEN '고양이'
                    WHEN animal = '댕댕이' THEN '개'
                    WHEN animal = '곰돌이' THEN '곰'
                    WHEN animal = '폭스' THEN '여우'
                    ELSE animal
                    END
    `);

    await queryRunner.query(`
        ALTER TABLE users
            MODIFY COLUMN primary_animal ENUM('고양이', '개', '곰', '여우'),
            MODIFY COLUMN second_animal ENUM('고양이', '개', '곰', '여우'),
            MODIFY COLUMN profile_anumal ENUM('고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE posts
            MODIFY COLUMN animal_of_author ENUM('고양이', '개', '곰', '여우')
    `);

    await queryRunner.query(`
        ALTER TABLE item_cart
            MODIFY COLUMN animal ENUM('고양이', '개', '곰', '여우')
    `);
  }
}
