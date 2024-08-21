import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class TaskService {
  @Inject(ArticleService)
  private articleService: ArticleService;

  // 定义一个定时任务 设置执行时间
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCron() {
    // console.log('task execute---');
    await this.articleService.flushRedisToDB();
  }
}
