var fs = require('fs')
  , path = require('path')
  , injection = fs.readFileSync(path.join(__dirname, 'mixin.js'))
  ;

module.exports =
{
  name: 'buster-rendr-functional-tests',

  create: function (options)
  {
    var instance = Object.create(this);

    instance.options = options || {};

    // client side timeout, provided in seconds, default 60 seconds
    instance.options.timeout = instance.options.timeout ? instance.options.timeout*1000 : 60000;

    return instance;
  },

  configure: function(conf)
  {
    conf.on('load:framework', function(rs)
    {
      rs.addResource({
          path: '/buster/functional_mixin.js',
          // and add options
          content: injection.toString().replace(/(\}\)\(buster)(\);)/, '$1, '+JSON.stringify(this.options)+'$2')
      });
      rs.loadPath.append('/buster/functional_mixin.js');
    }.bind(this));
  },

  testRun: function(testRunner)
  {
    // increase timeout on the server side,
    // to allow for network hiccups
    testRunner.timeout = this.options.timeout + 30000;
  }
};
