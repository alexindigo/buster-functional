var config = module.exports;

config['Unit tests'] =
{
  environment: 'node',
  rootPath: '../',
  sources:
  [
    'lib/**/*.js'
  ],
  tests:
  [
    'test/test-*.js'
  ],
  extensions:
  [
    require('buster-istanbul')
  ],
  'buster-istanbul':
  {
    outputDirectory: 'coverage',
    format: 'lcov'
  }
};

// workaround for browser-bound loader
global.buster = {testRunner: {onCreate: function(){}}};
