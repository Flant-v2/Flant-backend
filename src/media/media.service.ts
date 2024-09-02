import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Manager } from 'src/admin/entities/manager.entity';
import _ from 'lodash';
import { Media } from './entities/media.entity';
import { MediaFile } from './entities/media-file.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MESSAGES } from 'src/constants/message.constant';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(MediaFile)
    private readonly mediaFileRepository: Repository<MediaFile>,
  ) {}
  async create(
    user: PartialUser,
    createMediaDto: CreateMediaDto,
    imageUrl: string[] | undefined,
    videoUrl: string | undefined,
  ) {
    const managerId = user?.roleInfo?.roleId;

    const publishTime = new Date(
      createMediaDto.year,
      createMediaDto.month - 1,
      createMediaDto.day,
      createMediaDto.hour,
      createMediaDto.minute,
    );

    const createdData = await this.mediaRepository.save({
      communityId: createMediaDto.communityId,
      managerId: managerId,
      title: createMediaDto.title,
      content: createMediaDto.content,
      publishTime: publishTime,
    });

    if (imageUrl && imageUrl.length > 0) {
      for (let image of imageUrl) {
        const mediaImageData = {
          mediaId: createdData.mediaId,
          managerId: managerId,
          mediaFileUrl: image,
        };
        await this.mediaFileRepository.save(mediaImageData);
      }
    }
    if (videoUrl) {
      const mediaVideoData = {
        mediaId: createdData.mediaId,
        managerId: managerId,
        mediaFileUrl: videoUrl,
      };
      await this.mediaFileRepository.save(mediaVideoData);
    }
    return {
      status: HttpStatus.CREATED,
      message: MESSAGES.MEDIA.CREATE.SUCCEED,
      data: createdData,
    };
  }

  async findAll(communityId: number) {
    const currentTime = new Date();
    const mediaData = await this.mediaRepository.find({
      where: {
        communityId: communityId,
        publishTime: LessThanOrEqual(currentTime),
      },
      order: { createdAt: 'DESC' },
      relations: ['mediaFiles'],
    });
    return {
      status: HttpStatus.OK,
      message: MESSAGES.MEDIA.FINDALL.SUCCEED,
      data: mediaData,
    };
  }

  async findOne(mediaId: number) {
    const singleMediaData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
      relations: ['mediaFiles'],
    });
    return {
      status: HttpStatus.OK,
      message: MESSAGES.MEDIA.FINDONE.SUCCEED,
      data: singleMediaData,
    };
  }

  async updateThumbnail(mediaId: number, imageUrl: string) {
    const mediaData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
    });
    if (!mediaData) {
      throw new NotFoundException(MESSAGES.MEDIA.UPDATETHUMBNAIL.NOT_FOUND);
    }

    if (!imageUrl) {
      throw new BadRequestException(MESSAGES.MEDIA.UPDATETHUMBNAIL.BAD_REQUEST);
    }

    await this.mediaRepository.update(
      { mediaId: mediaId },
      { thumbnailImage: imageUrl },
    );
    const updatedData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
    });

    return {
      status: HttpStatus.OK,
      message: MESSAGES.MEDIA.UPDATETHUMBNAIL.BAD_REQUEST,
      data: updatedData,
    };
  }

  async update(
    user: PartialUser,
    mediaId: number,
    updateMediaDto: UpdateMediaDto,
    imageUrl: string[] | undefined,
    videoUrl: string | undefined,
  ) {
    const mediaData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
    });
    if (!mediaData) {
      throw new NotFoundException(MESSAGES.MEDIA.UPDATE.NOT_FOUND);
    }

    if (_.isEmpty(updateMediaDto)) {
      throw new BadRequestException(MESSAGES.MEDIA.UPDATE.BAD_REQUEST);
    }
    const newData = {
      title: mediaData.title,
      content: mediaData.content,
      publishTime: mediaData.publishTime,
    };

    const newPublishTime = new Date(
      updateMediaDto.year,
      updateMediaDto.month - 1,
      updateMediaDto.day,
      updateMediaDto.hour,
      updateMediaDto.minute,
    );

    if (newPublishTime != mediaData.publishTime) {
      newData.publishTime = newPublishTime;
    }
    if (updateMediaDto.title != mediaData.title) {
      newData.title = updateMediaDto.title;
    }
    if (updateMediaDto.content != mediaData.content) {
      newData.content = updateMediaDto.content;
    }
    const managerId = user?.roleInfo?.roleId;
    if ((imageUrl && imageUrl.length > 0) || videoUrl) {
      await this.mediaFileRepository
        .createQueryBuilder()
        .delete()
        .from(MediaFile)
        .where('media_id = :mediaId', { mediaId })
        .execute();

      if (imageUrl) {
        for (let image of imageUrl) {
          const mediaImageData = {
            mediaId: mediaData.mediaId,
            managerId: managerId,
            mediaFileUrl: image,
          };
          await this.mediaFileRepository.save(mediaImageData);
        }
      }
      if (videoUrl) {
        const mediaVideoData = {
          mediaId: mediaData.mediaId,
          managerId: managerId,
          mediaFileUrl: videoUrl,
        };
        await this.mediaFileRepository.save(mediaVideoData);
      }
    }

    await this.mediaRepository.update({ mediaId: mediaId }, newData);

    const updatedData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
    });
    return {
      status: HttpStatus.ACCEPTED,
      message: MESSAGES.MEDIA.UPDATE.SUCCEED,
      data: updatedData,
    };
  }

  async remove(mediaId: number) {
    const mediaData = await this.mediaRepository.findOne({
      where: { mediaId: mediaId },
    });
    if (!mediaData) {
      throw new NotFoundException(MESSAGES.MEDIA.REMOVE.NOT_FOUND);
    }

    await this.mediaRepository.delete(mediaId);
    return {
      status: HttpStatus.OK,
      message: MESSAGES.MEDIA.REMOVE.SUCCEED,
      data: mediaId,
    };
  }
}
