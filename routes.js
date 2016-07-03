const helpers = require('./helpers');

module.exports = (app) => {
    app.use('/', require('./routes/index'));
    app.use('/api', helpers.middleware.checkxhr(), require('./routes/api/index'));
    app.use('/api', helpers.middleware.checkxhr(), require('./routes/api/feedback'));
    app.use('/api', helpers.middleware.checkxhr(), require('./routes/api/general'));
    app.use('/profile', require('./routes/legacy'));
    app.use('/faq', require('./routes/faq'));
    app.use('/about', require('./routes/about'));
    app.use('/surf', require('./routes/surf'));
    app.use('/search', require('./routes/search'));
    app.use('/user', require('./routes/user'));
    app.use('/admin', helpers.middleware.checkAuth(), helpers.middleware.checkAdmin(), require('./routes/admin'));
    app.use('/auth', require('./routes/auth'));
};
