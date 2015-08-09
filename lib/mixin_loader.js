/**
 * Expects BusterJS and busterFunctionalMixin to be on the page.
 *
 * Adds helper handlers to the Buster test suite
 * and augments new testCase objects with functional mixin
 */

// Don't pollute global namespace
(function(buster, options)
{
  // Hook into testRunner
  buster.testRunner.onCreate(function(runner)
  {
    // hide frames, to all for the full page experience
    runner.on('suite:start', function()
    {
      window.top.document.getElementsByTagName('frameset')[0].rows='0,*';
    });
    runner.on('suite:end', function(results)
    {
      // last resort to clean up cookies
      document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.top.document.getElementsByTagName('frameset')[0].rows='80px,*';
    });

    runner.on('context:end', function()
    {
      // clean up any leftovers
      document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    // add functional test helpers to the mix, and pass options
    runner.on('test:setUp', function(testCase){ return busterFunctionalMixin(testCase, options); });
  });
})(buster);
