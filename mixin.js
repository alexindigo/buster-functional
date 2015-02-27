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

      // Triggers touch on the element
      test.testCase.touch = function functional_mixin_touch(target, callback)
      {
        // get first element of the selection
        target = (typeof target == 'string' ? this.$(target) : target).first();

        // make it all async, to allow some time for event handlers to hook in
        // and keep them in more reabable flow in the test
        setTimeout(function()
        {
          // list events to trigger asynchronously
          // and group events needed to be triggered synchronously
          // as second dimension array
          // and pass extra arguments for createEvent function
          this._triggerEvents(target, ['touchstart', 'touchend', ['mousedown', 'mouseup', 'mouseclick']], target, callback);

        }.bind(this), this.delay);

        return this;
      };

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

      // Triggers select option element
      test.testCase.select = function function_mixin_select(target, optionValue, callback) {

        // get the first element of the selection
        target = (typeof target == 'string' ? this.$(target) : target).first();

        // sync all event handlers
        setTimeout(function() {

          this._triggerEvents(target, ['focus', 'touchstart', 'touchend', ['mousedown', 'mouseup', 'mouseclick', 'click']], target, function() {
            target.find('option[value=' + optionValue + ']').attr('selected', true).trigger('change');
            this._triggerEvents(target, ['blur'], target, callback);
          });

        }.bind(this), this.delay);

        return this;
      };

      // Types into input field
      test.testCase.type = function functional_mixin_type(target, text, callback)
      {
        var chars  = (text || '').split('');

        // get first element of the selection
        target = (typeof target == 'string' ? this.$(target) : target).first();

        // enters chars one by one
        function enterChar()
        {
          var char = chars.shift();

          // still have something to type
          if (char)
          {
            // list events to trigger asynchronously
            // and group events needed to be triggered synchronously
            // as second dimension array
            this._triggerEvents(target, [['keydown', 'keypress'], 'keyup'], char, enterChar.bind(this));
          }
          else
          {
            // be done after that
            setTimeout(this._delayedCallback.bind(this, callback), this._interactionDelay);
          }
        };

        // make it all async, to allow some time for event handlers to hook in
        // and keep them in more reabable flow in the test
        setTimeout(function()
        {
          // start with focus event
          this.focus(target);

          setTimeout(enterChar.bind(this), this._interactionDelay);
        }.bind(this), this.delay);

        return this;
      }


    });
  });
})(buster);
