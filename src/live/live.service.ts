import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import NodeMediaServer from 'node-media-server';
import Crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { User } from 'src/user/entities/user.entity';
import { Artist } from 'src/admin/entities/artist.entity';
import _ from 'lodash';
import { Live } from './entities/live.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { UpdateLiveDto } from './dtos/update-live.dto';

@Injectable()
export class LiveService {
  private readonly nodeMediaServer: NodeMediaServer;
  private s3Client: S3Client;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Artist)
    private readonly artistsRepository: Repository<Artist>,
    @InjectRepository(Live)
    private readonly liveRepository: Repository<Live>,
  ) {
    // AWS S3 클라이언트 초기화
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const liveConfig = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000,
        mediaroot: '../media', // path.join(__dirname, '../../media'),
        webroot: './www',
        hls: true, // HLS 사용 설정
        allow_origin: '*',
      },
      https: {
        port: 8443,
        key: '/etc/letsencrypt/live/live.flant.club/privkey.pem',
        cert: '/etc/letsencrypt/live/live.flant.club/fullchain.pem',
      },
      trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        //ffmpeg: '/Users/pc/Downloads/ffmpeg-2024-08-18-git-7e5410eadb-full_build/ffmpeg-2024-08-18-git-7e5410eadb-full_build/bin/ffmpeg.exe',
        tasks: [
          {
            app: 'live',
            vc: 'libx264', // x264 비디오 코덱 사용 (H.264는 인코딩 시 그래픽카드의 GPU 사용 > 사양 좋아야함.. x264는 CPU 사용)
            vcParam: [
              '-crf',
              '18', // CRF 값 (인코딩시 사용되는 품질 기준값, 18은 거의 무손실, 23은 기본값)
              '-preset',
              'slow', // 인코딩 프리셋 (한 프레임을 만드는 데에 얼마나 CPU 자원을 사용할지, 느려질수록 같은 비트레이트에서 더 나은  품질)
              '-b:v',
              '4M', // 비디오스트림 비트레이트 (초당 비트 전송률, 즉 1초당 용량, 4M는 4 Mbps)
              '-maxrate',
              '4M', // 최대 비트레이트
              '-bufsize',
              '8M', // 버퍼(임시 저장공간?) 사이즈 (8MB)
            ],
            ac: 'aac',
            acParam: ['-ab', '64k', '-ac', '1', '-ar', '44100'],
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            // hlsKeep: true, // to prevent hls file delete after end the stream
            // ffmpegParams: '-loglevel debug -report', // FFmpeg 로그 기록
            // dash: true,
            // dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
            // dashKeep: true, // to prevent dash file delete after end the stream
          },
          {
            app: 'live',
            mp4: true,
            mp4Flags: '[movflags=frag_keyframe+empty_moov]',
          },
        ],
      },
      // fission: {
      //   // 화질별 분할
      //   //'/usr/bin/ffmpeg',
      //   ffmpeg:
      //     '/Users/82104/Downloads/ffmpeg-7.0.1-essentials_build/ffmpeg-7.0.1-essentials_build/bin/ffmpeg.exe',
      //   tasks: [
      //     {
      //       rule: 'live/*',
      //       model: [
      //         //   { // 1080p 추가하면 인코딩 과부하 걸림...
      //         //     ab: '128k',                // 오디오 비트레이트
      //         //     vb: '2000k',               // 비디오 비트레이트 (2 Mbps)
      //         //     vs: '1920x1080',           // 비디오 해상도
      //         //     vf: '30',                  // 프레임 레이트 (초당 프레임수, 30 fps)
      //         // },
      //         {
      //           ab: '128k',
      //           vb: '1500k',
      //           vs: '1280x720',
      //           vf: '30',
      //         },
      //         {
      //           ab: '96k',
      //           vb: '1000k',
      //           vs: '854x480',
      //           vf: '24',
      //         },
      //         {
      //           ab: '96k',
      //           vb: '600k',
      //           vs: '640x360',
      //           vf: '20',
      //         },
      //       ],
      //     },
      //   ],
      // },
    };
    this.nodeMediaServer = new NodeMediaServer(liveConfig);
  }

  async onModuleInit() {
    // 서버 실행하면서 미디어서버도 같이 실행
    this.nodeMediaServer.run();

    // 방송 전 키값이 유효한지 검증 (따로 암호화 없음, 유효기간만 검증함)
    await this.nodeMediaServer.on(
      'prePublish',
      async (id: string, streamPath: string) => {
        console.log(
          '-----------------------방송시작직전--------------------------',
        );
        const session = this.nodeMediaServer.getSession(id);
        const streamKey = streamPath.split('/live/')[1].split('_')[0];

        const live = await this.liveRepository.findOne({
          where: {
            streamKey,
          },
        });
        console.log('----------------foundData----------------');
        console.log(live);
        if (!live) {
          console.log('-------------에러------------');
          console.log('라이브 스트림키를 확인해주세요.');
          session.reject((reason: string) => {
            console.log(reason);
          });
        }
        const time = new Date();
        const diff = Math.abs(time.getTime() - live.createdAt.getTime()) / 1000;
        // if (diff > 6000) {
        //   // 1분 이내에 스트림키 입력 후 방송 시작이 돼야함
        //   console.log('-------------에러------------');
        //   console.log('라이브 스트림키의 유효기간이 만료되었습니다.');
        //   session.reject((reason: string) => {
        //     console.log(reason);
        //   });
        // }
        /* else*/ if (live.liveVideoUrl) {
          console.log('-------------에러------------');
          console.log('이미 사용 완료된 스트림키입니다.');
          session.reject((reason: string) => {
            console.log(reason);
          });
        }
        console.log('------------------------방송시작?------------------');
      },
    );

    // 방송 종료
    await this.nodeMediaServer.on(
      'donePublish',
      async (id: string, streamPath: string) => {
        console.log('---------------------------방송종료?------------------');
        console.log(streamPath);
        const streamKey = streamPath.split('/live/')[1];
        console.log('streamKey: ' + streamKey);
        const live = await this.liveRepository.findOne({
          where: { streamKey },
        });

        // const liveDirectory = path.join(
        //   __dirname,
        //   '../../media/live',
        //   streamKey,
        // );
        const liveDirectory = '../media/live/' + streamKey;
        console.log(
          `-------------------------------Reading directory: ${liveDirectory}`,
        );

        if (!fs.existsSync(liveDirectory)) {
          console.error('Live directory does not exist:', liveDirectory);
          return;
        }

        const files = fs.readdirSync(liveDirectory);
        console.log('Files in directory:', files);

        const fileName = files.find((file) => path.extname(file) === '.mp4');

        if (!fileName) {
          console.error('No .mp4 file found in directory:', liveDirectory);
          return;
        }

        const filePath = path.join(liveDirectory, fileName);
        console.log(
          '-------------------------------------------------Reading file:',
          filePath,
        );
        const file = fs.readFileSync(filePath);

        if (live) {
          const liveVideoUrl = await this.liveRecordingToS3(
            fileName,
            file,
            'mp4',
          );
          await this.liveRepository.update(
            { liveId: live.liveId },
            { liveVideoUrl },
          );
        }
        fs.unlinkSync(filePath);
        fs.rmdirSync(liveDirectory);
        // await this.cleanupStreamFolder(streamKey);
        console.log(
          '----------------------repository 업데이트, 삭제 완-----------------------',
        );
      },
    );
  }

  async liveRecordingToS3(
    fileName: string, // 업로드될 파일의 이름
    file, // 업로드할 파일
    ext: string, // 파일 확장자
  ) {
    console.log(
      '-------------------------------------종료후업로드전-----------',
    );
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `liveRecordings/${fileName}`,
      Body: file,
      ContentType: `video/${ext}`,
    });

    try {
      await this.s3Client.send(command);
      // 업로드된 이미지의 URL 반환
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/liveRecordings/${fileName}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error; // 에러를 상위 함수로 전달
    }
  }

  async cleanupStreamFolder(streamKey: string) {
    const folderPath = '../media/live/' + streamKey; //path.join(__dirname, '../../media/live', streamKey);
    console.log('folderPath: ' + folderPath);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const curPath = path.join(folderPath, file);
        fs.unlinkSync(curPath);
      }
      fs.rmdirSync(folderPath);
    }
  }

  async createLive(artistId: number, title: string, thumbnailImage: string) {
    // userId로 커뮤니티아티인지 확인 + 어느 커뮤니티인지 조회
    const artist = await this.artistsRepository.findOne({
      where: {
        artistId,
      },
      relations: {
        community: true,
        communityUser: true,
      },
    });
    if (_.isNil(artist)) {
      throw new NotFoundException({
        status: 404,
        message: '아티스트 회원 정보를 찾을 수 없습니다.',
      });
    }
    // 키 발급
    const streamKey = Crypto.randomBytes(20).toString('hex');
    const live = await this.liveRepository.save({
      communityId: artist.communityId,
      artistId: artistId,
      title,
      thumbnailImage,
      streamKey,
    });
    return {
      liveServer: 'rtmp://52.79.234.150/live',
      title: live.title,
      streamKey: live.streamKey,
    };
    //return { liveServer: 'rtmp://localhost/live', ...live };
  }

  async findAllLives(communityId: number) {
    const lives = await this.liveRepository.find({
      where: {
        communityId,
      },
      order: { createdAt: 'DESC' },
    });
    return lives;
  }

  async watchLive(liveId: number) {
    const live = await this.liveRepository.findOne({
      where: {
        liveId,
      },
      // relations: {
      //   community: true,
      //   artist: true,
      // }
    });
    if (_.isNil(live)) {
      throw new NotFoundException({
        status: 404,
        message: '해당 라이브가 존재하지 않습니다.',
      });
    }
    return {
      liveId: live.liveId,
      communityId: live.communityId,
      // communityName: live.communityId.communityName,
      // communityLogoImage: live.community.communityLogoImage,
      artistId: live.artistId,
      // artistNickname: live.artist.artistNickname,
      title: live.title,
      liveHls: `https://live.flant.club/live/${live.streamKey}/index.m3u8`,
      // liveHls: `http://54.180.24.150:8000/live/${live.streamKey}/index.m3u8`,
      isOnAir: !live.liveVideoUrl,
    };
  }

  async watchRecordedLive(liveId: number) {
    const live = await this.liveRepository.findOne({
      where: {
        liveId,
      },
      // relations: {
      //   community: true,
      //   artist: true,
      // }
    });
    if (_.isNil(live)) {
      throw new NotFoundException({
        status: 404,
        message: '해당 라이브가 존재하지 않습니다.',
      });
    } else if (!live.liveVideoUrl) {
      throw new BadRequestException({
        status: 400,
        message: '해당 라이브는 다시보기로 시청이 불가능합니다.',
      });
    }
    return {
      liveId: live.liveId,
      communityId: live.communityId,
      // communityName: live.communityId.communityName,
      // communityLogoImage: live.community.communityLogoImage,
      artistId: live.artistId,
      // artistNickname: live.artist.artistNickname,
      title: live.title,
      liveVideoUrl: live.liveVideoUrl,
    };
  }

  async updateLive(liveId: number, updateLiveDto: UpdateLiveDto) {
    const { title, thumbnailImage } = updateLiveDto;
    const live = await this.liveRepository.findOne({
      where: {
        liveId,
      },
      // relations: {
      //   community: true,
      //   artist: true,
      // }
    });
    if (_.isNil(live)) {
      throw new NotFoundException({
        status: 404,
        message: '해당 라이브가 존재하지 않습니다.',
      });
    }

    await this.liveRepository.update(
      {
        liveId,
      },
      {
        title,
        thumbnailImage,
      },
    );

    return {
      liveId,
      communityId: live.communityId,
      // communityName: live.communityId.communityName,
      // communityLogoImage: live.community.communityLogoImage,
      artistId: live.artistId,
      // artistNickname: live.artist.artistNickname,
      title,
      thumbnailImage,
    };
  }
}
