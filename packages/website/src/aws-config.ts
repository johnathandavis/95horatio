import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
      identityPoolId: process.env.REACT_APP_AUTH_IDENTITY_POOL_ID,
      region: process.env.REACT_APP_AUTH_REGION,
      identityPoolRegion: process.env.REACT_APP_AUTH_REGION,
      userPoolId: process.env.REACT_APP_AUTH_USER_POOL_ID,
      userPoolWebClientId: process.env.REACT_APP_AUTH_USER_POOL_WEB_CLIENT_ID,
      // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: true,

      cookieStorage: {
        domain: process.env.REACT_APP_AUTH_COOKIE_STORAGE_DOMAIN,
        path: '/',
        expires: 30,
        sameSite: "strict",
        secure: true
      },

      // OPTIONAL - Hosted UI configuration
      oauth: {
      domain: 'userauth.95horatio.johndavis.dev',
      scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      redirectSignIn: 'https://95horatio.johndavis.dev',
      redirectSignOut: 'https://95horatio.johndavis.dev',
      responseType: 'code' 
    }
  }
});
