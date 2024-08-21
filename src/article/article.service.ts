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

  async view(id: number, userId: string) {
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
      // 为了避免同一个人反复刷阅读量导致的计数不准确 我们在此存一个10分钟过期的标记 有这个标记的时候阅读量不增加
      await this.redisService.set(`user_${userId}_article_${id}`, 1, 3);
      return article.viewCount;
    } else {
      const flag = await this.redisService.get(`user_${userId}_article_${id}`);
      if (flag) {
        return res.viewCount;
      }
      await this.redisService.hashSet(`article_${id}`, {
        ...res,
        viewCount: +res.viewCount + 1,
      });

      await this.redisService.set(`user_${userId}_article_${id}`, 1, 3);
      return +res.viewCount + 1;
    }
  }

  async flushRedisToDB() {
    // 将redis数据同步到数据库
    const keys = await this.redisService.keys('article_*');
    // console.log(keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const res = await this.redisService.hashGet(key);
      const [, id] = key.split('_');
      await this.entityManager.update(
        Article,
        {
          id: +id,
        },
        {
          viewCount: +res.viewCount,
        },
      );
    }
  }
}
