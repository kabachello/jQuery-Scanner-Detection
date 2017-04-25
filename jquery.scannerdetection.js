/*
 * jQuery Scanner Detection
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Scanner-Detection
 *
 * Version: 1.2.2
 *
 */
(function($){
    $.fn.scannerDetection = function(options) {

        // If string given, call onComplete callback
        if(typeof options === "string") {
            return this.each(function(){
                this.scannerDetectionTest(options);
            });
        }

        // If false (boolean) given, deinitialize plugin
        if(options === false) {
            return this.each(function(){
                this.scannerDetectionOff();
            });
        }

        if(typeof options === "function"){
            options = {onComplete: options};
        }

        var settings = $.extend({
            onComplete: function() {}, // Callback after detection of a successful scanning (scanned string in parameter)
            onError: function() {}, // Callback after detection of a unsuccessful scanning (scanned string in parameter)
            onReceive: function() {}, // Callback after receiving and processing a char (scanned char in parameter)
            onKeyDetect: function() {}, // Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
            timeBeforeScanTest: 100, // Wait duration (ms) after keydown event to check if scanning is finished
            avgTimeByChar: 30, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
            minLength: 6, // Minimum length for a scanning
            endChar: [9,13], // Chars to remove and means end of scanning
            startChar: [], // Chars to remove and means start of scanning
            ignoreIfFocusOn: false, // do not handle scans if the currently focused element matches this selector
            scanButtonKeyCode: null, // Key code of the scanner hardware button (if the scanner button a acts as a key itself)
            scanButtonLongPressThreshold: 3, // How many times the hardware button should issue a pressed event before a barcode is read to detect a longpress
            onScanButtonLongPressed: function() {}, // Callback after detection of a successful scan while the scan button was pressed and held down
            stopPropagation: false, // Stop immediate propagation on keydown event
            preventDefault: false // Prevent default action on keydown event
        }, options || {});

        function getCharacterFromEvent(e) {
            var code = e.which;

            // These are special cases that don't fit the ASCII mapping
            var exceptions = {
                32: ' '.charCodeAt(0),
                186: 59, // ;
                187: 61, // =
                188: 44, // ,
                189: 45, // -
                190: 46, // .
                191: 47, // /
                192: 96, // `
                219: 91, // [
                220: 92, // \
                221: 93, // ]
                222: 39, // '
                //numeric keypad
                96: '0'.charCodeAt(0),
                97: '1'.charCodeAt(0),
                98: '2'.charCodeAt(0),
                99: '3'.charCodeAt(0),
                100: '4'.charCodeAt(0),
                101: '5'.charCodeAt(0),
                102: '6'.charCodeAt(0),
                103: '7'.charCodeAt(0),
                104: '8'.charCodeAt(0),
                105: '9'.charCodeAt(0),
                106: '*'.charCodeAt(0),
                107: '+'.charCodeAt(0),
                109: '-'.charCodeAt(0),
                110: '.'.charCodeAt(0),
                111: '/'.charCodeAt(0)
            };


            // Filter out non-alphanumeric key codes unless they're one of the exceptions
            if(code < 48 || code > 90) {
                if(exceptions[code] !== undefined) {
                    code = exceptions[code];
                } else {
                    return null
                }
            }

            var ch = String.fromCharCode(code);

            // If shifted translate characters, otherwise make lowercase
            if(e.shiftKey) {
                var special = {
                    1: '!',
                    2: '@',
                    3: '#',
                    4: '$',
                    5: '%',
                    6: '^',
                    7: '&',
                    8: '*',
                    9: '(',
                    0: ')',
                    ',': '<',
                    '.': '>',
                    '/': '?',
                    ';': ':',
                    "'": '"',
                    '[': '{',
                    ']': '}',
                    '\\': '|',
                    '`': '~',
                    '-': '_',
                    '=': '+'
                };

                if(special[ch] !== undefined) {
                    ch = special[ch];
                }
            } else {
                ch = ch.toLowerCase();
            }
            return ch;
        }

        return this.each(function() {
            var self = this,
                $self = $(self),
                firstCharTime = 0,
                lastCharTime = 0,
                stringWriting = '',
                callIsScanner = false,
                testTimer = false,
                scanButtonCounter = 0;

            self.initScannerDetection = function() {
                firstCharTime = 0;
                stringWriting = '';
                scanButtonCounter = 0;
            };

            self.isFocusOnIgnoredElement = function() {
                if (!settings.ignoreIfFocusOn) {
                    return false;
                }
                if(typeof settings.ignoreIfFocusOn === 'string') {
                    return $(':focus').is(options.ignoreIfFocusOn);
                }

                if(typeof settings.ignoreIfFocusOn === 'object' && settings.ignoreIfFocusOn.length > 0) {
                    var focused=$(':focus');
                    for(var i=0; i<settings.ignoreIfFocusOn.length; i++){
                        if(focused.is(settings.ignoreIfFocusOn[i])){
                            return true;
                        }
                    }
                }

                return false;
            };

            self.scannerDetectionOff = function() {
                $self.unbind('keydown.scannerDetection');
                $self.unbind('keypress.scannerDetection');
            };

            self.scannerDetectionTest = function(s) {
                // If string is given, test it
                if (s) {
                    firstCharTime = lastCharTime = 0;
                    stringWriting = s;
                }

                if (!scanButtonCounter) {
                    scanButtonCounter = 1;
                }

                var scanDuration = lastCharTime - firstCharTime;
                var scanDurationThreshold = stringWriting.length * settings.avgTimeByChar;

                // If the scan was long enough and done fast enough, it was a successful scan. Otherwise, error.
                if (stringWriting.length >= settings.minLength && scanDuration <= scanDurationThreshold) {
                    if (scanButtonCounter > settings.scanButtonLongPressThreshold) {
                        settings.onScanButtonLongPressed.call(self, stringWriting, scanButtonCounter);
                    } else {
                        settings.onComplete.call(self, stringWriting, scanButtonCounter);
                    }
                    $self.trigger('scannerDetectionComplete', {string: stringWriting});
                    self.initScannerDetection();
                    return true;
                } else {
                    settings.onError.call(self, stringWriting);
                    $self.trigger('scannerDetectionError', {string: stringWriting});
                    self.initScannerDetection();
                    return false;
                }
            };

            $self.unbind('.scannerDetection');

            $self.bind('keydown.scannerDetection', function(e) {

                if (this.isFocusOnIgnoredElement()) {
                    return;
                }

                // If it's just the button of the scanner, ignore it and wait for the real input
                if(settings.scanButtonKeyCode !== null && e.which === settings.scanButtonKeyCode) {
                    scanButtonCounter++;
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    settings.onKeyDetect.call(self,e);
                    $self.trigger('scannerDetectionKeyDetect',{evt:e});
                    return;
                }



                if (settings.stopPropagation) {
                    e.stopImmediatePropagation();
                }

                if (settings.preventDefault) {
                    e.preventDefault();
                }

                // If it's not the first character and we encounter a terminating character, trigger scan process
                if (firstCharTime && settings.endChar.indexOf(e.which) !== -1) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner = true;

                // If it's the first character and we encountered one of the starting characters, don't process the scan
                } else if(!firstCharTime && settings.startChar.indexOf(e.which) !== -1) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner = false;

                // Otherwise, just add the character to the scan string we're building
                } else {
                    var character = getCharacterFromEvent(e);
                    if (character === null) {
                        return;
                    }
                    stringWriting += character;
                    callIsScanner = false;
                }

                if (!firstCharTime) {
                    firstCharTime = Date.now();
                }

                lastCharTime = Date.now();

                if (testTimer) {
                    clearTimeout(testTimer);
                }

                if (callIsScanner) {
                    self.scannerDetectionTest();
                    testTimer = false;
                } else {
                    testTimer = setTimeout(self.scannerDetectionTest,settings.timeBeforeScanTest);
                }

                settings.onReceive.call(self,e);
                $self.trigger('scannerDetectionReceive',{evt:e});
            });
        });
    }
})(jQuery);
