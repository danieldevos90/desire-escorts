export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      // To use S3 or R2, replace provider and add credentials via env
      // provider: '@strapi/provider-upload-aws-s3',
      // providerOptions: {
      //   accessKeyId: env('AWS_ACCESS_KEY_ID'),
      //   secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      //   region: env('S3_REGION'),
      //   params: {
      //     Bucket: env('S3_BUCKET'),
      //   },
      //   endpoint: env('S3_ENDPOINT'),
      // },
    },
  },
});
