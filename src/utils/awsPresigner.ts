import AWS_SDK from 'aws-sdk';
import {
  AWS_CONFIG_DATA,
  IMAGES_SERVER_URL,
  S3_BUCKET_NAME,
} from './constants';
import { AWSUrl } from './types';

AWS_SDK.config = new AWS_SDK.Config(AWS_CONFIG_DATA);

const s3 = new AWS_SDK.S3();

export const generateGetURL = (key: string): AWSUrl => {
  return {
    url: `${IMAGES_SERVER_URL}/${key}`,
    result: true
  };
}

export const generatePutURL = async (
  key: string,
  contentType: string,
): Promise<AWSUrl> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }

    s3.getSignedUrl('putObject', params, (err, url) => {
      if (err) {
        reject({
          url: '',
          result: false,
        });
      } else {
        resolve({
          url,
          result: true,
        });
      }
    });
  });
}
