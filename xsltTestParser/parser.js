(function() {
  var headings = [
    'Test Name:',
    'Test FullName:',
    'Test Source:',
    'Test Outcome:', 
    'Test Duration:',
    'Result Message:',
    'Dom Compare Results:',
    'FileName:',
    'Expected output',
    'Expected XHTML:',
    'Actual XHTML:',
    'Expected XML:',
    'Actual XML:',
  ],
    metaHeadings = [
    'Test Name:',
    'Test FullName:',
    'Test Source:',
    'Test Outcome:', 
    'Test Duration:',
    'Result Message:',
  ];

  function startsWithHeading(str) {
    var headingStr;
    headings.some(function(heading) {
      if(str.indexOf(heading) > -1) {
        headingStr = heading;
        return true;
      }
    });
    return headingStr;
  }

  function parse(input) {
    var lines = input.split('\n');
    var data = lines.reduce(function(acc, item) {
      var str = $.trim(item)
      var heading = startsWithHeading(str);
      if(!str) {
        return acc;
      }
      if(heading) {
        acc.push({name: heading, str: $.trim(str.replace(heading, '').replace('\n', ''))});
      } else {
        acc[acc.length-1].str = acc[acc.length-1].str + str;
      }
      return acc;
    }, [])

    data = data.reduce(function(acc, item) {
      if(metaHeadings.includes(item.name)) {
        acc.metaData[item.name] = item.str;
      } else if(item.name == 'Dom Compare Results:'){
        acc.compareResults.push({meta: '', expected: '', actual: ''})
      } else if(item.name == 'FileName:') {
        acc.compareResults[acc.compareResults.length-1].name = item.str;
      } else if(item.name == 'Expected XHTML:' || item.name == 'Expected XML:') {
        acc.compareResults[acc.compareResults.length-1].expected = item.str;
      } else if(item.name == 'Actual XHTML:' || item.name == 'Actual XML:') {
        acc.compareResults[acc.compareResults.length-1].actual = item.str;
      }
      return acc;
    }, {metaData: {}, compareResults: []})
    return data;
  }

  function compare(leftHtml, rightHtml) {
    var left = html_beautify(leftHtml);
    var right = html_beautify(rightHtml);

    var diff = JsDiff.diffWords(left, right);

    var difElement = document.createElement('div');

    var data = diff.reduce(function(acc, item) {
      if(item.added) {
        acc.added++;
      } else if(item.removed) {
        acc.removed++
      }
      return acc;
    }, {added: 0, removed: 0})
    var dataElement = document.createElement('div');
    dataElement.innerHTML = 'Added: ' + data.added + ' Removed: ' + data.removed;
    difElement.appendChild(dataElement);


    var preElement = document.createElement('pre');
    for (var i=0; i < diff.length; i++) {

      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        var swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }

      var node;
      if (diff[i].removed) {
        node = document.createElement('del');
        node.appendChild(document.createTextNode(diff[i].value));
      } else if (diff[i].added) {
        node = document.createElement('ins');
        node.appendChild(document.createTextNode(diff[i].value));
      } else {
        node = document.createTextNode(diff[i].value);
      }
      preElement.appendChild(node);
    }
    difElement.appendChild(preElement);

    return difElement;
  }

  window.parse = parse;
  window.compare = compare;
})()