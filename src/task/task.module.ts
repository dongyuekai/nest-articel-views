import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ArticleModule } from 'src/article/article.module';

@Module({
  // 在TaskModule引入ArticleModule
  imports: [ArticleModule],
  providers: [TaskService],
})
export class TaskModule {}
