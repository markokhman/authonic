Authonic works only with Firebase, but it is powerful enough to save you from troubles and quick start your project.
Here is Firebase quick start https://www.firebase.com/docs/web/quickstart.html

1. Install component via bower and command line (root of your project) <b>bower install authonic</b>
(Or simply download it from GitHub https://github.com/markusila/authonic.git)

2. Include auth.js script in <b>index.html</b> and in <b>app.js</b> file as module

     index.html file:
     <script src="lib/authonic/auth.js"></script>

     app.js file:
     angular.module('starter.controllers', ['auth'])

3.Register new Google and Facebook apps:

    Google App

    To get started with Google authentication, you need to first create a new Google application. Click the Create Project button on that page and fill in a name and ID for your project. Once your application is created, navigate to APIs & auth → Credentials in the left-hand navigation menu, and select Create New Client ID.

    Firebase requires web application access, so select Web application. Set Authorized JavaScript origins to https://auth.firebase.com. Finally, set the Authorized Redirect URI to https://auth.firebase.com/v2/<YOUR-FIREBASE-APP>/auth/google/callback. This allows Google's OAuth service to talk to the Firebase Authentication servers.

    Make sure your application also has it's Product Name set on the APIs & auth → Consent Screen or Google will return a 401 error when authenticating.

    After configuring your Google application, head on over to the Login & Auth section in your App Dashboard. Enable Google authentication and then copy your Google application credentials (Client ID and Client Secret) into the appropriate inputs. You can find your Google application's client ID and secret from the sameAPIs & auth → Credentials page you were just on. Look for them under the Client ID for web application header.

    Facebook App

    To get started with Facebook authentication, you need to first create a new Facebook application. Click the Add a New App button in the top right of that page and select Website as your platform. Then choose an App ID and click Create New Facebook App ID. Select your app's category and click Create App ID. In the top right, click Skip Quick Start.

    In your Facebook app configuration, click on the Settings tab on the left-hand navigation menu. Then go to the Advanced tab at the top and scroll down to the Security section. At the bottom of that section, add https://auth.firebase.com/v2/<YOUR-FIREBASE-APP>/auth/facebook/callback to your Valid OAuth redirect URIs and click Save Changes at the bottom of the page.

    Next, you'll need to get your app credentials from Facebook. Click on the Basic tab at the top of the page. You should still be within the Settings tab. Towards the top of this page, you will see your App ID and App Secret. Your App ID will be displayed in plain text and you can view your App Secret by clicking on the Show button and typing in your Facebook password. Copy these Facebook application credentials (App ID and Secret) in the Login & Auth section in your App Dashboard.
     

1) Firebase

First of all You will need to configure your Firebase to be able to authorise via email, Google or Facebook.
Go to Login & Auth and then use these tabs:

- Email: Just set the checkbox
- Facebook:

3. All you need to

3. Basic instances needed:

- AuthService
- Session
- $timeout - for result messages hiding
- INFO - constants with application names

Example:
.controller('AppCtrl', function($scope,$rootScope, AuthService, Session, $timeout, INFO){}

4. Quickstart code

if (window.localStorage.getItem(INFO.applicationNAME+"User") != null) {
      Session.create(JSON.parse(window.localStorage.getItem(INFO.applicationNAME+"User")));
      $scope.user = Session.user;
  } else {
    console.log("No user found in cookies")
    AuthService.showLoginPopup();
  }

$rootScope.$on('auth-login-success', function () {
    $scope.user = Session.user;
  });
  $rootScope.$on('auth-logout-success', function () {
    $scope.user = null;
  });

  $scope.showProfilePopup = function () {
    AuthService.showProfilePopup();
  }
  $scope.showLoginPopup = function () {
    AuthService.showLoginPopup();
  }
  $scope.logout = function () {
    AuthService.logout();
  }

https://github.com/srameshr/ionic-starter-oauth Starter with both working
https://github.com/Wizcorp/phonegap-facebook-plugin Guide on Facebook native auth
https://github.com/EddyVerbruggen/cordova-plugin-googleplus  Guide on Google+ plugin

http://ionicframework.com/docs/guide/publishing.html  - how to sign apt

If you want to log in through native apps installed on your User’s device follow these steps:

Development mode (for production mode you will need to create production keystore and follow steps and the end of this guide )

Facebook
1. Get key hash for Facebook Developer Console

Use this command and password “android":

keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64

2. Go to your Facebook app (if you haven’t yet - create one https://developers.facebook.com) Go to Settings (left side) -> Add platform ->Android
Fill in following values Google Play Package Name (ex. com.ionicframework.blablabla), className (ex. com.ionicframework.blablabla.ProjectActivity) and key hash that you got in first step

Google+
1. Get SHA1 for Facebook Developer Console

Use this command and password “android":
$ keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -list -v