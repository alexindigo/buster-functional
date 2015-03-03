// Expects Buster to be on the page

// Don't pollute global namespace
(function(buster, options)
{
  // no function
  function noop(){};

  // Creates new iframe and makes it fill in all available space
  function createIframe(src)
  {
    var iframe = document.createElement('iframe');

    iframe.src            = src;
    // make it nice
    iframe.width          = '100%';
    iframe.height         = '100%';
    iframe.vspace         = '0';
    iframe.hspace         = '0';
    iframe.scrolling      = 'yes';
    iframe.marginWidth    = '0';
    iframe.marginHeight   = '0';
    iframe.frameBorder    = '0';
    // make it even better
    iframe.style.border   = '0';
    iframe.style.width    = '100%';
    iframe.style.height   = '100%';
    iframe.style.top      = '0px';
    iframe.style.left     = '0px';
    iframe.style.position = 'fixed';

    return iframe;
  }

  // Loads requested page in new iframe
  // and attaches it to the body
  function loadInIframe(src, callback)
  {
    var iwin, idoc, iframe = createIframe(src);

    // wait for it to load
    iframe.onload = function()
    {
      // get reference to iframe internals
      iwin = iframe.contentWindow;
      idoc = iframe.contentDocument || iframe.contentWindow.document;

      // get jQuery reference
      i$ = iwin.$;

      // adjust window object with custom handler
      this._enhanceHandler.call(this, iwin);

      // return gathered data
      callback(iframe, i$, iwin, idoc);
    }.bind(this);

    document.body.appendChild(iframe);
  }

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

    runner.on('context:end', function(results)
    {
      // clean up any leftovers
      document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    // add functional test helpers to the mix
    runner.on('test:setUp', function(test)
    {

      // Scrolls page to the top by half of the height of the target element
      test.testCase.scroll = function functional_mixin_scroll(target, callback)
      {
        target = (typeof target == 'string' ? this.$(target) : target).first();
        var position = this.$(target).offset().top + (this.$(target).outerHeight(true) / 2);
        var scroll = {
          scrollTop: position
        };
        setTimeout(function() {
          this.$('html, body').animate(scroll, this._interactionDelay, this._delayedCallback.bind(this, callback));
        }.bind(this), this.delay);

        return this;
      };

    });
  });
})(buster);
