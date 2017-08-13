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
    consumerKey: 'whAdQ0eWMzQ3ZH9qUO1umkm7Q',
    consumerSecret: 'TBNILwBmKdatfFXji999jGxhm0yPvNSB4LLDRjK15ajovZf0cE',
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
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {successRedirect: '/', failureRedirect: '/'}));

  app.get('/logout', (req, res, next) => {
    req.logout();
    res.status(200);
    res.send('ログアウトしました');
  }); 
  return app;
};


module.exports = init;
