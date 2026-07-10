const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

/**
 * This helper exist for learning purposes and isn't
 * the cleanest or most practical approach for the specific
 * case where the file is only being filtered by its extension.
 * To do so, it's recommended to use ParseFilePipewith FileTypeValidator
 * from `@nestjs/common` instead.
 */
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  if (!file) {
    callback(new Error('File is empty.'), false);
    return;
  }

  const fileExtension = file.mimetype.split('/').at(1)!;

  if (!allowedExtensions.includes(fileExtension)) {
    callback(new Error(`File extension must be one of: ${JSON.stringify(allowedExtensions)}`), false);
  }

  callback(null, true);
};
