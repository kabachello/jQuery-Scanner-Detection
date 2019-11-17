jQuery Scanner Detection
========================

**UNMAINTAINED**: this plugin is not maintained anymore! Use [onScan.js](https://github.com/axenox/onscan.js) instead - a completely rewritten vanilla JS library with enhanced functionality, support for latest mobile devices, paste-mode scanners and more.  

jQuery Scanner Detection is a small plugin to detect when user use a scanner (barcode, QR Code...) instead of a keyboard, and call specific callbacks.


How use it
----------
To initialize the detection, 2 ways:

    $(selector).scannerDetection(); // Initialize with default options
    $(selector).scannerDetection({...}); // Initialize with an object that contains options
    $(selector).scannerDetection(function(){...}); // Initialize with a function that is onComplete callback
    
To simulate a scanning after initialisation:

    $(selector).scannerDetection('scanned string');
	
To disable the detection (deinitialize):

    $(selector).scannerDetection(false);
	
See a detailed tutorial with presets for different scanner models and first steps to take when starting [here](http://a.kabachnik.info/jquery-scannerdetection-tutorial.html).


Options
-------
### onComplete
Default: false  
Callback after detection of a successful scanning
### onError
Default: false  
Callback after detection of a unsuccessful scanning (scanned string in parameter)
### onReceive
Default: false  
Callback after receiving and processing a char (scanned char in parameter)
### onKeyDetect
Default: false  
Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
### onScanButtonLongPressed
Default: false  
Callback after detection of a successfull scan while the scan button was pressed and held down. This can only be used if the scan button behaves as a key itself (see scanButtonKeyCode). This long press event can be used to add a secondary action. For example, if the primary action is to count some items with barcodes (e.g. products at goods-in), it is comes very handy if a number pad pops up on the screen when the scan button is held. Large number can then be easily typed it instead of scanning fifty times in a row. 
Note: this option requires scanButtonKeyCode to be set to a valid key code!
### timeBeforeScanTest
Default: 100  
Wait duration (ms) after keypress event to check if scanning is finished
### avgTimeByChar
Default: 30  
Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
### minLength
Default: 6  
Minimum length for a scanning
### endChar
Default: [9,13]  
Chars to remove and means end of scanning
### startChar
Default: []  
Chars to remove and means start of scanning
### ignoreIfFocusOn
Default: false  
Ignore scans if the currently focused element matches this selector. Per example, if you set this option to 'input', scanner detection will be disable if an input is focused, when the scan occurs.
### scanButtonKeyCode
Default: false  
Key code of the scanner hardware button (if the scanner button a acts as a key itself). Knowing this key code is important, because it is not part of the scanned code and must be ignored. On the other hand, knowing it can be usefull: pressing the button multiple times fast normally results just in one scan, but you still could count the number of times pressed, allowing the user to input quantities this way (typical use case would be counting product at goods-in). 
### scanButtonLongPressThreshold
Default: 3  
You can let the user perform some special action by pressing and holding the scan button. In this case the button will issue multiple keydown events. This parameter sets, how many sequential events should be interpreted as holding the button down.  
### stopPropagation
Default: false  
Stop immediate propagation on keypress event
### preventDefault
Default: false  
Prevent default action on keypress event


Events
------
All callbacks are of type function and can also be bound as event listeners.  
Like this, you can add multiple callbacks for each event.  
Of course, events exist only if plugin is initialized on selector.

    $(selector)
        .bind('scannerDetectionComplete',function(e,data){...})
        .bind('scannerDetectionError',function(e,data){...})
        .bind('scannerDetectionReceive',function(e,data){...})

### scannerDetectionComplete
Callback after detection of a successful scanning  
Event data: {string: "scanned string"}
### scannerDetectionError
Callback after detection of a unsuccessful scanning  
Event data: {string: "scanned string"}  
### scannerDetectionReceive
Callback after receive and process a char  
Event data: {evt: {original keypress event}}
### scannerDetectionKeyDetect
Callback after detecting a keyDown - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
Event data: {evt: {original keypress event}}

Requirements
------------
jQuery > 1.4.4. Note, that some odd side effects may occur before version 1.6, if your event handlers rely on using the event object (for example calling e.which from within the onKeyDetect handler).

Browser compatibility
---------------------
On old IE browser (IE<9), `Date.now()` and `Array.indexOf()` are not implemented.  
If you plan to use this plugin on these browsers, please add jquery.scannerdetection.compatibility.js file before the plugin.
