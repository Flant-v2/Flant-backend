import { S3Client } from '@aws-sdk/client-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const thumbnailImageUploadFactory = (): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: process.env.AWS_BUCKET_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }),
      bucket: process.env.AWS_BUCKET_NAME,
      acl: 'public-read-write',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata(req, file, callback) {
        callback(null, { owner: 'it' });
      },
      key(req, file, callback) {
        const ext = extname(file.originalname); // 확장자
        const baseName = basename(file.originalname, ext); // 확장자 제외
        // 파일이름-날짜.확장자
        const fileName = `thumbnailImages/${baseName}-${Date.now()}${ext}`;
        callback(null, fileName);
      },
    }),
    /* 파일 크기 제한
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    */
  };
};