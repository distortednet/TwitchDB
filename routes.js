var helpers = require('./helpers');

module.exports = (app) => {
  app.use('/',  require('./routes/index'));
  app.use('/api',  helpers.middleware.checkxhr(), require('./routes/api'));
  app.use('/faq',  require('./routes/faq'));
  app.use('/about',  require('./routes/about'));
  app.use('/disclaimer',  require('./routes/disclaimer'));
  app.use('/surf',  require('./routes/surf'));
  app.use('/search',  require('./routes/search'));
  app.use('/profile',  helpers.middleware.checkAuth(), require('./routes/profile'));
  app.use('/user',  require('./routes/user'));
  app.use('/admin',  helpers.middleware.checkAuth(), helpers.middleware.checkAdmin(),  require('./routes/admin'));
  app.use('/auth',  require('./routes/auth'));
}
