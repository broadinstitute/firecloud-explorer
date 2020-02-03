// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  testing: false,
  GOOGLE_URL: 'https://www.googleapis.com/',
  // google authorization values
  CLIENT_ID: '60387149286-vj4e50v7dneg598m9ead6jqtu67ifj2p.apps.googleusercontent.com',
  CLIENT_SECRET: 'c8Gc0oD4Eof7xL95rMrPP1N7',
  REDIRECT_URI: 'http://localhost:4200',
  BUCKET_NAME: 'bucket-privado',
  AUTHORIZATION_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://www.googleapis.com/oauth2/v4/token',
  GOOGLE_PROFILE_URL: 'https://www.googleapis.com/userinfo/v2/me',
  FIRECLOUD_API: 'https://api.firecloud.org/',
  FIRECLOUD_URL: 'https://portal.firecloud.org/',
  LIMIT_TRANSFERABLES: 3,
  FORUM_URL: 'https://gatkforums.broadinstitute.org/firecloud/categories/fc-explorer'
};
