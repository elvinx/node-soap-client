"use strict";
var parseString = require('xml2js').parseString;

var prefixMatch = new RegExp(/(?!xmlns)^.*:/);

function stripPrefix(str) {
  return str.replace(prefixMatch, '');
}

function parseNumbers(str) {
  if (!isNaN(str)) {
    str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
  }
  return str;
}
var xmlToObject = function (xml, method, callback) {

  var error = [];
  var response = false;

  var options = {
    tagNameProcessors: [stripPrefix],
    valueProcessors: [parseNumbers],
    explicitArray: false,
    ignoreAttrs: true

  };
  parseString(xml, options, function (err, result) {

    if (err) error.push(err);

    if (result && result['Envelope'] && result['Envelope']['Body']['Fault']) {

      error.push(result['Envelope']['Body']['Fault']);
    }

    if (!result) {
      error.push({message: 'Something went wrong'});
    } else {

      response = result['Envelope'] ? result['Envelope']['Body'][method + "Response"] : {'return': null};
    }
    if (error.length === 0) error = false;

    callback(error, response)
  });

};

exports.xmlToObject = xmlToObject;
