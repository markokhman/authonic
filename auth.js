angular.module('auth', [])


// CONSTANTS
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  sessionUpdated: 'session-updated',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  user: 'user'
})

.constant('INFO', {
  applicationNAME: 'authStarter',
  firebaseURL: 'https://myauthstarter.firebaseio.com'
})

// SERVICES
.factory('AuthService', function ($http, Session, INFO, $q, $ionicModal, $rootScope, AUTH_EVENTS, $http, $ionicPlatform) {
  var authService = {}
 
  // 1 GROUP PUBLIC METHOD
  authService.showLoginPopup = function () {
    $ionicModal.fromTemplateUrl('lib/authonic/login.html').then(function(modal) {
      authService.loginModal = modal;
      authService.loginModal.show();
    });
  }

  // 1 GROUP PUBLIC METHOD
  authService.hideLoginPopup = function () {
    authService.loginModal.hide();
  }

  // 1 GROUP PUBLIC METHOD
  authService.showProfilePopup = function () {
    if (authService.isAuthenticated()) {
      $ionicModal.fromTemplateUrl('lib/authonic/profile.html').then(function(modal) {
        authService.profileModal = modal;
        authService.profileModal.show();
      });
    } else {
      console.log("No user is logged in to view Profile")
      authService.showLoginPopup();
    }
  }

  // 1 GROUP PUBLIC METHOD
  authService.hideProfilePopup = function () {
    authService.profileModal.hide();  
  }

  // 2 GROUP PUBLIC METHOD
  authService.loginEmail = function (credentials) {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL);
      ref.authWithPassword({
        email    : credentials.email,
        password : credentials.password
      }, function (error, authData) {
        if (error) {
          resolve({ 
            success : false,
            data : error.message 
          });
        } else {
          ref.child('users').child(authData.uid).once('value', function (snapshot) {
            if (snapshot.val()) {
              Session.create(snapshot.val());
              resolve({ 
                success : true,
                data : "Successfully logged in" 
              });
            } else {
              var userData = {
                uid : authData.uid,
                provider : authData.provider,
                email : authData[authData.provider].email,
                displayName : authData[authData.provider].email,
                profileImageURL : authData[authData.provider].profileImageURL
              }
              Session.create(userData);
              ref.child('users').child(authData.uid).set(userData, function (error) {
                if (!error) {
                  resolve({ 
                    success : true,
                    data : "Successfully saved User data" 
                  });
                } else {
                  resolve({ 
                    success : false,
                    data : "Could not save User data" 
                  });
                  console.log(error);
                }
              });
            }
          });
        }
      });
    });
  }

  authService.resetPassword = function (credentials) {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL);
      ref.resetPassword({
        email: credentials.email
      }, function(error) {
        if (error) {
          switch (error.code) {
            case "INVALID_USER":
              resolve({
                success: false,
                data: "User account for entered email does not exist."
              });
              break;
            default:
              resolve({
                success: false,
                data: error.message
              });
          }
        } else {
          resolve({
            success: true,
            data: "Password reset email sent successfully!"
          });
        }
      });
    });
  }

  authService.registerEmail = function (credentials) {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL);
      ref.createUser({
        email    : credentials.email,
        password : credentials.password
      }, function (error, userData) {
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              resolve({
                success: false,
                data: "The new user account cannot be created because the email is already in use."
              });
              break;
            case "INVALID_EMAIL":
              resolve({
                success: false,
                data: "The specified email is not a valid email."
              });
              break;
            default:
              resolve({
                success: false,
                data: error.message
              });
          }
        } else {
          resolve({ 
            success : true,
            data : "Successfully registered User" 
          });
        }
      });
    });
  }

  authService.loginFacebook = function () {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL); 

      var loginWithWebView = function () {
        ref.authWithOAuthPopup("facebook", function (error, authData) {
          if (error) {
            resolve({ 
              success : false,
              data : error.message 
            });
          } else {
            ref.child('users').child(authData.uid).once('value', function (snapshot) {
              if (snapshot.val()) {
                Session.create(snapshot.val());
                resolve({ 
                  success : true,
                  data : "Successfully logged in" 
                });
              } else {
                var userData = {
                  uid : authData.uid,
                  access_token : authData[authData.provider].accessToken,
                  provider : authData.provider,
                  email : authData[authData.provider].email,
                  displayName : authData[authData.provider].displayName,
                  profileImageURL : authData[authData.provider].profileImageURL
                }
                Session.create(userData);
                ref.child('users').child(authData.uid).set(userData, function (error) {
                  if (!error) {
                    resolve({ 
                      success : true,
                      data : "Successfully saved User data" 
                    });
                  } else {
                    resolve({ 
                      success : false,
                      data : "Could not save User data" 
                    });
                    console.log(error);
                  }
                });
              }
            });
          }
        });
      } 

      // Try login with native app
      if (window.plugins) {
        var fbLoginSuccess = function (userData) {
            console.log(userData);
            var access_token = userData.authResponse.accessToken;
            var url = '/me/?fields=about,name,picture,email';
            facebookConnectPlugin.api(
                url,
                ['public_profile','email'],
            function (response) {
             // SUccess function
              if (!response.email) {
                response.email = "none";
              };
              var userData = {
                uid : "facebooknative:"+response.id,
                access_token : access_token,
                provider : "facebooknative",
                email : response.email,
                displayName : response.name,
                profileImageURL : response.picture.data.url
              }
              console.log(userData)
              Session.create(userData);
              ref.child('users').child(response.id).set(userData, function (error) {
                if (!error) {
                  resolve({ 
                    success : true,
                    data : "Successfully saved User data" 
                  });
                } else {
                  resolve({ 
                    success : false,
                    data : "Could not save User data" 
                  });
                  console.log(error);
                }
              });
            },
            function (error) { console.error(error); }
            );
        }

        facebookConnectPlugin.login(["public_profile","email"],
            fbLoginSuccess,
            function (error) { 
              console.log(error);
              loginWithWebView(); 
            }
        );
      } else {
        loginWithWebView();
      }
    });
  }

  authService.loginGoogle = function () {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL);

      var loginWithWebView = function () {
        ref.authWithOAuthPopup("google", function (error, authData) {
          if (error) {
            resolve({ 
              success : false,
              data : error.message 
            });
          } else {
            console.log(authData)
            ref.child('users').child(authData.uid).once('value', function (snapshot) {
              if (snapshot.val()) {
                Session.create(snapshot.val());
                resolve({ 
                  success : true,
                  data : "Successfully logged in" 
                });
              } else {
                var userData = {
                  uid : authData.uid,
                  email : authData[authData.provider].cachedUserProfile.email,
                  access_token : authData[authData.provider].accessToken,
                  provider : authData.provider,
                  displayName : authData[authData.provider].displayName,
                  profileImageURL : authData[authData.provider].profileImageURL
                }
                Session.create(userData);
                ref.child('users').child(authData.uid).set(userData, function (error) {
                  if (!error) {
                    resolve({ 
                      success : true,
                      data : "Successfully saved User data" 
                    });
                  } else {
                    resolve({ 
                      success : false,
                      data : "Could not save User data" 
                    });
                    console.log(error);
                  }
                });
              }
            });
          }
        }, {
          scope: "email"
        });
      } 

      var loginWithNativeApp = function () {
        window.plugins.googleplus.login({
          // 'scopes': '... ', // optional space-separated list of scopes, the default is sufficient for login and basic profile info
          'offline': true // optional and required for Android only - if set to true the plugin will also return the OAuth access token, that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
          // 'webApiKey': 'api of web app', // optional API key of your Web application from Credentials settings of your project - if you set it the returned idToken will allow sign in to services like Azure Mobile Services
          // there is no API key for Android; you app is wired to the Google+ API by listing your package name in the google dev console and signing your apk (which you have done in chapter 4)
        },
        function (obj) {
          console.log(obj);
          var email = obj.email;
          var term=null;
          var access_token = obj.oauthToken;
          // changed_access_token = access_token.replace('.','_');
          // console.log(changed_access_token)
          $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+access_token).
            then(function(response) {
              console.log(response);
              
              var userData = {
                  uid : "googlenative:"+response.data.id,
                  email : email,
                  access_token : access_token,
                  provider : "googlenative",
                  displayName : response.data.name,
                  profileImageURL : response.data.picture
                }
                console.log(userData)
                Session.create(userData);
                ref.child('users').child("googlenative:"+response.data.id).set(userData, function (error) {
                  if (!error) {
                    resolve({ 
                      success : true,
                      data : "Successfully saved User data" 
                    });
                  } else {
                    resolve({ 
                      success : false,
                      data : "Could not save User data" 
                    });
                    console.log(error);
                  }
                });

              resolve({ 
                success : true,
                data : "Successfully logged in" 
              });

            }, function(response) {
              console.log(response)
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
          },
          function (msg) {
            loginWithWebView();
          }
        );
      } 

      // Try login with native app
      if (window.plugins && window.plugins.googleplus) {
        window.plugins.googleplus.isAvailable(function (available) {
          if (available) {
            loginWithNativeApp();
          } else {
            loginWithWebView();
          }
        });
      } else {
        loginWithWebView();
      }
    });
  }

  authService.isAuthenticated = function () {
      return !!Session.user;
  }

  authService.changePassword = function (credentials) {
    return $q(function (resolve, reject) {
      if (credentials.password && credentials.newpassword && credentials.email) {
        var ref = new Firebase(INFO.firebaseURL);  
        ref.changePassword({
          email: credentials.email,
          oldPassword: credentials.password,
          newPassword: credentials.newpassword
        }, function(error) {
          if (error) {
            switch (error.code) {
              case "INVALID_PASSWORD":
                resolve({
                  success : false,
                  data : "The specified user account password is incorrect."
                })
                break;
              case "INVALID_USER":
                resolve({
                  success : false,
                  data : "The specified user account does not exist."
                })
                break;
              default:
                resolve({
                  success : false,
                  data : error.message
                })
            }
          } else {
            resolve({
              success : true,
              data : "User password changed successfully!"
            })
          }
        });
      };
    });
  }

  authService.updateProfile = function (user) {
    return $q(function (resolve, reject) {
      var ref = new Firebase(INFO.firebaseURL);
      ref.child('users').child(user.uid).set(user, function (error) {
        if (!error) {
          resolve({
            success : true,
            data : "Profile successfully updated"
          });
        } else {
          resolve({
            success : false,
            data : "Could not update profile"
          });
        }
      });
    });
  }

  // 2 GROUP PUBLIC METHOD
  authService.logout = function () {
      var ref = new Firebase(INFO.firebaseURL);
      ref.unauth();
      Session.destroy();
      // If there is Google native app - forget user and account
      if (window.plugins && window.plugins.googleplus) {
        window.plugins.googleplus.isAvailable(function (available) {
          if (available) {
            window.plugins.googleplus.logout(
                function (msg) {
                  console.log(msg); // do something useful instead of alerting
                  window.plugins.googleplus.disconnect(
                      function (msg) {
                        console.log(msg); // do something useful instead of alerting
                      }
                  );
                }
            );
          }
        });
      }
      if (window.plugins) {
        facebookConnectPlugin.logout(function (success) {
          console.log(success)
        }, function (error) {
          console.log(error)
        });
      }
      $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
  }

  return authService;
})

.service('Session', function (INFO) {
  this.create = function (userData) {
    this.user = userData;
    window.localStorage.setItem(INFO.applicationNAME+'User', JSON.stringify(userData));
  };
  this.destroy = function () {
    this.user = null;
     window.localStorage.removeItem(INFO.applicationNAME+'User');
  };
})

// CONTROLLERS
.controller('LoginCtrl', function ($scope, $rootScope, AUTH_EVENTS, Session, AuthService, $timeout, $ionicLoading, $http) {
  $scope.credentials = {
    email: '',
    password: ''
  }
  $scope.registerCredentials = {
    email: '',
    password: '',
    repassword: ''
  }

  $scope.wrongconfirm = false;
  $scope.emptyemail = false;

  $scope.loginFacebook = function () {
    $ionicLoading.show();
    AuthService.loginFacebook().then(function (result) {
      if (result.success) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $ionicLoading.hide();
        AuthService.hideLoginPopup()
      } else {
        $ionicLoading.hide();
        $scope.message = result.data;
        $timeout(function() {
          $scope.message = null;
        }, 3000);
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      }
    });
  }
  $scope.loginGoogle = function () {
    $ionicLoading.show();
    AuthService.loginGoogle().then(function (result) {
      if (result.success) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $ionicLoading.hide();
        AuthService.hideLoginPopup()
      } else {
        $ionicLoading.hide();
        $scope.message = result.data;
        $timeout(function() {
          $scope.message = null;
        }, 3000);
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      }
    });
  }

  $scope.loginEmail = function (credentials) {
    console.log("Loggin via Email")
    $ionicLoading.show();
    AuthService.loginEmail(credentials).then(function (result) {
      if (result.success) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.credentials = {
          email: '',
          password: ''
        }
        $ionicLoading.hide();
        AuthService.hideLoginPopup()
      } else {
        $scope.message = result.data;
        $ionicLoading.hide();
        $timeout(function() {
          $scope.message = null;
        }, 3000);
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      }
    });
  }

  $scope.registerEmail = function (registerCredentials) {
    $ionicLoading.show();
    
    // Email validation
    if (registerCredentials.email=='') {
      $scope.emptyemail = true;
    } else {
      $scope.emptyemail = false;
    }

    //Password confirmation 
    if (registerCredentials.password==registerCredentials.repassword) {
      $scope.wrongconfirm = false;
    } else {
      $scope.wrongconfirm = true;
    }

    if (!$scope.wrongconfirm && !$scope.emptyemail) {
      // Registering User
      AuthService.registerEmail(registerCredentials).then(function (result) {
        if (result.success) {

          // Logging user in if registration succeeds
          AuthService.loginEmail(registerCredentials).then(function (result) {
            if (result.success) {
              $scope.registerCredentials = {
                email: '',
                password: '',
                repassword: ''
              }
              $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
              $ionicLoading.hide();
              AuthService.hideLoginPopup()
            } else {
              // Error results of login
              $ionicLoading.hide();
              $scope.message = result.data;
              $timeout(function() {
                $scope.message = null;
              }, 3000);    
            }
          });

        } else {
          // Error results of registration
          $ionicLoading.hide();
          $scope.message = result.data;
          $timeout(function() {
            $scope.message = null;
          }, 3000);
        }
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      }); 
    }
  }

  $scope.restorePassword = function (credentials) {
    // Email
    if (credentials.email=='') {
      $scope.emptyemail = true;
    } else {
      $scope.emptyemail = false;
    }

    if (!$scope.emptyemail) {
      AuthService.resetPassword(credentials).then(function (result) {
        if (result.success) {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          $scope.credentials = {
            email: '',
            password: ''
          }
          $scope.message = result.data;
          $timeout(function() {
            $scope.message = null;
          }, 3000);
        } else {
          $scope.message = result.data;
          $timeout(function() {
            $scope.message = null;
          }, 3000);
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
      });
    };
  }
  $scope.hideLoginPopup = function () {
    AuthService.hideLoginPopup()
  }
})

.controller('ProfileCtrl', function ($scope, $rootScope, Session, AuthService, $ionicPopup, AUTH_EVENTS, $timeout) {
  $scope.changesSaved = true;

  $rootScope.$on('session-updated', function () {
    $scope.user = Session.user
  });
  
  $scope.hideProfilePopup = function () {
    AuthService.hideProfilePopup();
  }
  if (!AuthService.isAuthenticated()) {
    AuthService.showLoginPopup();
  } else {
    $scope.user = Session.user;
  }

  $scope.saveChanges = function (credentials) {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Edit profile',
       template: 'Are you sure you want to save changes to your profile?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        AuthService.changePassword(credentials).then(function (result) {
          if (result.success) { 
            // Showing message result
            $scope.message = result.data;
            $timeout(function() {
              $scope.message = null;
              $scope.credentials.password = ""
              $scope.credentials.newpassword = ""
              $scope.changesSaved = true;
            }, 3000);

          } else {
            $scope.message = result.data;
            $timeout(function() {
              $scope.changesSaved = false;
              $scope.message = null;
            }, 3000);
          }
        });

        // Updating session (current user)
        Session.user.displayName = credentials.displayName;
        AuthService.updateProfile(Session.user).then(function (result) {
          if (result.success) {
            $scope.message = result.data;
            $rootScope.$broadcast(AUTH_EVENTS.sessionUpdated);
            $timeout(function() {
              $scope.changesSaved = true;
              $scope.message = null;
            }, 3000);
          } else {
            $scope.message = result.data;
            $timeout(function() {
              $scope.changesSaved = false;
              $scope.message = null;
            }, 3000);
          }
        })
      }
    });
  }

  $scope.changesMade = function () {
    $scope.changesSaved = false;
  }
 
  $scope.credentials = {
    email : Session.user.email,
    displayName : Session.user.displayName,
    password : "",
    newpassword : ""
  }

  $scope.logout = function () {
    AuthService.logout();
    AuthService.hideProfilePopup();
  }
});





