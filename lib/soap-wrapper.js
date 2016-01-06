"use strict";

var ws = require('ws.js'),
  Http = ws.Http;
var WSDL = require('./wsdl');

exports.SOAP = new function () {

}
// Create soap request
SOAP.prototype._createRequest= function(options) {

  var argsStr = '', methodStr = '';

  if (options.args) {

    var xml2js = require('xml2js');


    var builder = new xml2js.Builder({headless: true, explicitRoot: false, strict: false});
    var argsStr = builder.buildObject(options.args);

    var argsStr = argsStr.replace("<root>", "");

    var argsStr = argsStr.replace("</root>", "");

    methodStr = '<tns:' + options.method + '>' + argsStr + '</tns:' + options.method + '>';
  } else {
    methodStr = '<tns:' + options.method + '/>';
  }

  var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="' + options.namespace + '">'
    + '<soapenv:Header/>'
    + ' <soapenv:Body>'
    + methodStr
    + ' </soapenv:Body>'
    + '</soapenv:Envelope>';


  console.log("-------------------Request----------------");
  console.log(request);
  console.log("-------------------Request----------------");
  return request;

}

// Create soap client
function createClient(url, options, callback) {

  if (!url) {
    throw new Error("Url is required!");
  }
  if (!options.method || !options.namespace) {
    throw new Error("Method and namespace options are required!");
  }

  var request = this._createRequest(options);

  var ctx = {
    request: request,
    url: url,
    contentType: "text/xml"
  };

  var handlers = [new Http()];

  ws.send(handlers, ctx, function (ctx) {

    if (ctx.response) {

      WSDL.xmlToObject(ctx.response, options.method, function (err, result) {

        ctx.responseObject = result;

        callback(err, ctx);

      });
    }
    else {
      callback({'error': 'Web services not working'}, ctx);
    }

  });
}

exports.SOAP.prototype.createClient = createClient;
