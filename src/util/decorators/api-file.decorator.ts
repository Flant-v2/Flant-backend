import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function ApiFile(fieldName: string, localOptions: MulterOptions) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

export function ApiFiles(fieldName: string, maxCount: number, localOptions: MulterOptions) {
  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor([{ name: fieldName, maxCount }], localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            }
          },
          content: {
            type: 'string'
          }
        },
      },
    }),
  );
}

export function ApiMedia(fileFields: { name: string, maxCount: number }[], localOptions?: MulterOptions) {
  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(fileFields, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: fileFields.reduce((acc, field) => {
          acc[field.name] = {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            }
          };
          return acc;
        }, {
          title: { type: 'string' },
          content: { type: 'string' },
          year: { type: 'number' },
          month: { type: 'number' },
          day: { type: 'number' },
          hour: { type: 'number' },
          minute: { type: 'number' },
        }),
      },
    }),
  );
}
