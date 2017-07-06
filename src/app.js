const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const account = require('./Account')

const MongoManager = require('./MongoManager');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);

const index = require('../routes/index');
const users = require('../routes/users');
const app = express();

const mongoExpress = require('mongo-express/lib/middleware');
const mongoExpressConfig = require('../MongoConfig.js');

const init = async () => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port);
  //const io = socketIo.listen(server, {origins:'*:*'});
  // view engine setup
  //app.set('views', path.resolve(__dirname, './../views'));
  app.set('view engine', 'ejs');

  //セッションの設定
  const db = await MongoManager.getDb();
  const  sessionStore = new MongoStore({db});
  app.use(Session({
    secret: 'cocoro',
    rollong: true,
    store: sessionStore
    })
  );

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  //app.use(express.static(path.join(__dirname, '/../public')));

  const accountApp = await account();
  app.use(accountApp);
  app.use('/admin', mongoExpress(mongoExpressConfig));

  app.use('/', index);
  app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}
init();
//module.exports = init;
