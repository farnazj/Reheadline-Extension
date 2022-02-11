
/*
changes curly quotes to their non-curly counterparts
*/
function uncurlify(s) {
    return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

function curlify(s) {

    let doubleQuoteCount = 0;
    let singleQuoteCount = 0;

    for (let i = 0; i < s.length; i++) {
        if (s.charAt(i) == '"')
            doubleQuoteCount += 1;
        else if (s.charAt(i) == "'")
            singleQuoteCount += 1;
    }

    let replacedStr = '';
    for (let i = 0 ; i < s.length; i++) {
        if (!["'", '"'].includes(s.charAt(i)))
            replacedStr += s.charAt(i);
        else {
            if (s.charAt(i) == "'") { //replacing single quotes
                if (i < singleQuoteCount/2)
                    replacedStr += '\u2018';
                else
                    replacedStr += '\u2019';
            }
            else { //replacing double quotes
                if (i < doubleQuoteCount/2)
                    replacedStr += '\u201C';
                else
                    replacedStr += '\u201D';
            }
        }
    }

    return replacedStr;
}
  
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    }
}

function throttle (callback, limit) {
    var waiting = false;                      // Initially, we're not waiting
    return function () {                      // We return a throttled function
        if (!waiting) {                       // If we're not waiting
            callback.apply(this, arguments);  // Execute users function
            waiting = true;                   // Prevent future invocations
            setTimeout(function () {          // After a period of time
                waiting = false;              // And allow future invocations
            }, limit);
        }
    }
}

function isTextLight(rgbText) {

    let rgbArr = rgbText.replace('rgb(', '').replace(')', '').split(',').map(el => el.trim());
    let r = parseInt(rgbArr[0]);  // extract red
    let g = parseInt(rgbArr[1]);  // extract green
    let b = parseInt(rgbArr[2]);  // extract blue

    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma > 128) {
        return true;
    }
    return false;
}

  export default {
      uncurlify,
      curlify,
      debounce,
      throttle,
      isTextLight
  }