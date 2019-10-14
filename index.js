var request = require('request')

console.log('hello world');
console.log('logging in');

var orderList = [];
var podList = {};
request(
  {
    method: 'POST',
    url:'https://demo-v3.openlmis.org/api/oauth/token?grant_type=password&username=administrator&password=password',
    headers: {
      'Authorization': 'Basic dXNlci1jbGllbnQ6Y2hhbmdlbWU='
    }
  },
  function (err, httpResponse, body) {
    var response = JSON.parse(body);
    var token = 'bearer ' + response.access_token;
    var orderRequestParams = {
      page: 0,
    }
    request(
      {
        method: 'GET',
        url:'https://demo-v3.openlmis.org/api/orders?status=TRANSFER_FAILED&status=READY_TO_PACK&status=RECEIVED&status=SHIPPED&status=IN_ROUTE',
        headers: {
          'Authorization': token
        }
      },
      function (err, httpResponse, body) {
        var response = JSON.parse(body);
        for (var index in response.content) {
          var order = response.content[index];
          orderList.push(order);
          console.log('------')
          console.log('order id: ' + order.id);
          console.log('order code: ' + order.orderCode);
          console.log('requesting facility: ' + order.facility.name);
          console.log('supplying depot: ' + order.supplyingFacility.name);
          console.log('program: ' + order.program.name);
          console.log('period: ' + order.processingPeriod.name);
          console.log('order date: ' + order.createdDate)
          console.log('emergency: ' + order.emergency);
          console.log('------')
          var orderReqUrl = 'https://demo-v3.openlmis.org/api/proofsOfDelivery?orderId=' + order.id;
          request(
            {
              method: 'GET',
              url: orderReqUrl,
              headers: {
                'Authorization': token
              }
            },
            function (err, httpResponse, body) {
              var response = JSON.parse(body);
              if (response.content.length > 0) {
                podList[order.id] = response;

                var lineItems = response.content[0].lineItems;
                for (var index in lineItems) {
                  var lineItem = lineItems[index];
                  var orderablesHref = lineItem.orderable.href;
                  request(
                    {
                      method: 'GET',
                      url: orderablesHref,
                      headers: {
                        'Authorization': token
                      }
                    },
                    function (err, httpResponse, body) {
                      var response = JSON.parse(body);
                      console.log(response.fullProductName);

                      console.log('lot ' + lineItem.lot);
                      // for (var index in response.content) {
                      //   var item = response.content[index];
                      //   console.log(item)
                      // }

                    }
                  );
                }
              }

              // for (var index in  response.lineItems) {
              //   var lineItem = response.lineItems[index];
              //   console.log(lineItem);
              // }
            }
          );
        }

      }
    );
  }
);
