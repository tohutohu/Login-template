const express = require('express');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const MongoManager = require('./MongoManager.js');

const app = express();

let dbUser;

const init = async () => {
  dbUser = await MongoManager.getCollection('user');

  passport.serializeUser(function(user, done){
    done(null, user);
  });

  passport.deserializeUser(function(obj, done){
    done(null, obj);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new TwitterStrategy({
    consumerKey: '739379223303880704-qga8MIVgUw6XZKjGIXHYsO4hx9DRtF5',
    consumerSecret: 'lOGhteBBsguaKM051RWAmZNH3s7qMb8RTPwwVvn6uYoG3',
    callbackURL: (process.env.SERVER ? 'https://hatasa-server.ichigojam.trap.show' : 'http://localhost:3000' )+ '/auth/twitter/callback'
  },

  function(token, tokenSecret, profile, done){
    dbUser.findOne({username:profile.username}, (err, doc) => {
      if(!doc){
        dbUser.insert(profile);
      }
    });

    process.nextTick(function(){
      return done(null, {id:profile.username, type:'twitter'});
    });
  })
  );

  function isAuth(req, res, next){
    if(!req.isAuthenticated()){
      return next();
    }else{
      res.redirect('https://gachaking.trap.games');
    }
  }

  app.get('/login', isAuth, (req, res, next) => {
    res.render('login');
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {successRedirect: 'https://gachaking.trap.games', failureRedirect: 'https://gachaking.trap.games'}));

  app.get('/logout', (req, res, next) => {
    req.logout();
    res.status(200);
    res.send('ログアウトしました');
  }); 
  return app;
};


module.exports = init;
