import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async findOne(id: number) {
    return await this.entityManager.findOneBy(Article, {
      id,
    });
  }

  // 阅读接口 阅读量+1
  async view(id: number) {
    const article = await this.findOne(id);
    article.viewCount++;
    await this.entityManager.save(article);
    return article.viewCount;
  }
}
