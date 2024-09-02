import { S3Client } from '@aws-sdk/client-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multerS3 from 'multer-s3';
import { basename, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const extensionFilter = (req, file, callback) => {
  const allowedImageExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedVideoExtensions = ['video/mp4', 'video/avi'];

  if (allowedImageExtensions.includes(file.mimetype) ||
      allowedVideoExtensions.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('이미지 확장자는 jpeg, jpg, png, 동영상 확장자는 mp4, avi 지원됩니다.'), false);
  }
}

// 공통 S3 설정 생성 함수 (multerOption)
const createS3Storage = (folder: string): MulterOptions => ({
  storage: multerS3({
    s3: new S3Client({
      region: process.env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
    bucket: process.env.AWS_BUCKET_NAME,
    // acl: 'public-read-write',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(req, file, callback) {
      callback(null, { owner: 'it' });
    },
    key(req, file, callback) {
      const ext = extname(file.originalname);
      //   const baseName = basename(file.originalname, ext);
      const uuid = uuidv4();
      const fileName = `${folder}/${uuid}${ext}`;
      callback(null, fileName);
    },
  }),
  fileFilter: extensionFilter,
});

export const UserProfileUploadFactory = (): MulterOptions =>
  createS3Storage('userProfiles');

export const postImageUploadFactory = (): MulterOptions =>
  createS3Storage('postImages');

export const noticeImageUploadFactory = (): MulterOptions =>
  createS3Storage('noticeImages');

export const logoImageUploadFactory = (): MulterOptions =>
  createS3Storage('logoImages');

export const coverImageUploadFactory = (): MulterOptions =>
  createS3Storage('coverImages');

export const thumbnailImageUploadFactory = (): MulterOptions =>
  createS3Storage('thumbnailImages');

export const mediaFileUploadFactory = (): MulterOptions =>
  createS3Storage('mediaFiles')
