import { Controller, Get, Param } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // 根据id查找
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  // 阅读接口
  @Get(':id/view')
  async view(@Param('id') id: string) {
    return await this.articleService.view(+id);
  }
}
