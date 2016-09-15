const metalsmith = require('metalsmith'),
      path       = require('path'),
      markdown   = require('metalsmith-markdown'),
      layouts    = require('metalsmith-layouts'),
      permalinks = require('metalsmith-permalinks'),
      minifier   = require('metalsmith-html-minifier'),
      handlebars = require('handlebars'),
      config     = require('../config'),
      url        = require('url'),
      paths      = config.paths;

/**
 * HELPERS
 */
handlebars.registerHelper('itemOptionData', function (type) {
  var data = { 
    sort: this.text.replace(/[^\w]/, ''),
    from: this.from,
    type: type
  };

  if (this.deprecated) {
    data.deprecated = this.deprecated;
  }

  if (this.removed) {
    data.removed = this.removed;
  }

  return JSON.stringify(data);
});

handlebars.registerHelper('itemClass', function () {
  var className = 'v' + (this.from.replace('.', '-')) + ' ' + (this.doc.replace('.', '-'));

  if (this.deprecated) {
    className += ' v' + (this.deprecated.replace('.', '-')) + '-d';
  }

  if (this.removed) {
    className += ' v' + (this.removed.replace('.', '-')) + '-r';
  }

  return className;
});

handlebars.registerHelper('reverse', function (array) {
  array.reverse();
  return array;
});

/**
 * EXPORTS
 */
module.exports = function (done) {
  const publicPath = url.parse(config.url || '/').pathname;

  handlebars.registerHelper('url', function (file) {
    return path.join(publicPath, file);
  });

  metalsmith(paths.root)
    .metadata(config.metadata || {})
    .source(paths.src)
    .destination(paths.build)
    .clean(false)
    .use(markdown())
    .use(permalinks())
    .use(layouts({
      engine: 'handlebars',
      layouts: paths.layouts,
      partials: paths.partials,
      exposeConsolidate: function (requires) {
        requires.handlebars = handlebars;
      }
    }))
    .use(minifier({
      removeComments: false,
    }))
    .build(function(err, files) {
      if (err) {
        throw err;
      }

      done();
  });
};