import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Article } from './entities/article.entity';
import { RedisService } from 'src/redis/redis.service';

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
  @Inject(RedisService)
  private redisService: RedisService;

  async view(id: number) {
    // const article = await this.findOne(id);
    // article.viewCount++;
    // await this.entityManager.save(article);
    // return article.viewCount;

    // 通过redis来操作
    // 先查询redis 如果没查到就从数据库里查出来返回 并存到redis里
    // 查到了就更新redis的viewCount 直接返回 viewCount + 1
    const res = await this.redisService.hashGet(`article_${id}`);
    if (res.viewCount === undefined) {
      const article = await this.findOne(id);
      article.viewCount++;
      await this.entityManager.update(
        Article,
        { id },
        {
          viewCount: article.viewCount,
        },
      );
      await this.redisService.hashSet(`article_${id}`, {
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        collectCount: article.collectCount,
      });
    } else {
      await this.redisService.hashSet(`article_${id}`, {
        ...res,
        viewCount: +res.viewCount + 1,
      });
      return +res.viewCount + 1;
    }
  }
}
