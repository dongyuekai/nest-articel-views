import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService], // 导出ArticleService
})
export class ArticleModule {}
