let date = require('date-and-time');
let Stock = require('../models/stock');
let randomcolor = require('randomcolor');

function foramteDate(dates) {
  var dateArr = [];
  for (let i = 0; i < dates.length; i++) {
    dateArr.push(date.format(new Date(dates[i]), "MMM YY"));
  }
  return dateArr;
}

// Parse the stock data for chart and company card element in index.pug
function parseDataChart(quotes) {
  let returnData = {};
  let datasets = [];
  let symbols = [];
  let labelCount = 0;
  for (let i = 0; i < quotes.length; i++) {
    if (labelCount === 0) {
      returnData.labels = foramteDate(quotes[i].dates);
      labelCount++;
    }
    let obj = {};
    obj.data = quotes[i].data;
    obj.label = quotes[i].symbol;
    symbols.push(quotes[i].symbol);
    obj.borderColor = randomcolor();
    obj.fill = false;
    datasets.push(obj);
  }
  returnData.datasets = datasets;
  return {
    chartdata: returnData,
    symbols: symbols
  };

}


//check stock
function checkStock(stock) {
  return new Promise((resolve, reject) => {
    let query = Stock.findOne({
      symbol: stock
    });
    query.exec()
      .then((doc) => {
        if (doc) {
          reject("Already Present")
        } else {
          resolve("add");
        }
      });
  });
}



module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var getStocks = require('../API/getStocks');


  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'Watch Stock'
    });
  });

  // socket.io events
  io.on("connection", function (socket) {
    console.log("A user connected");
 
    // sends chart's data
    socket.on('chart', function (data) {
      let query = Stock.find({});
      query.exec()
        .then((quotes) => {
          let obj = {};
          if (quotes.length > 0) {
            obj = parseDataChart(quotes);
            obj.empty = false;
          } else {
            obj.empty = true;
          }
          io.sockets.emit('chart', obj);
        });
    });


    // Add stock in the database
    socket.on('add', function (data) {
      let stock = data.stock;
      stock = stock.toUpperCase();
      checkStock(stock)
        .then((data) => {
          return getStocks(stock);
        })
        .then((quote) => {
          var newStock = new Stock({
            symbol: quote.symbol,
            data: quote.data,
            dates: quote.date
          });
          return newStock.save();
        })
        .then((doc) => {
          let query = Stock.find({});
          return query.exec();
          //io.sockets.emit('chart',chartData);
        })
        .then((quotes) => {
          let obj = parseDataChart(quotes);
          obj.empty = false;
          io.sockets.emit('chart', obj);
        })
        .catch((e) => {
          if (e == "Already Present") {
            socket.emit('message', {
              text: "Already Present"
            });
          } else if (e === null) {
            socket.emit('message', {
              text: "Invalid Stock"
            });
          } else {
            socket.emit('message', {
              text: "Something went wrong"
            });
          }
        })
    });

    // Delete stock from database
    socket.on('delete', function(data) {
      let promise = Stock.remove({symbol: data.stock}).exec();
      promise
      .then((doc) => {
        let query = Stock.find({});
        return query.exec();
        //io.sockets.emit('chart',chartData);
      })
      .then((quotes) => {
        let obj = {};
        if (quotes.length > 0) {
          obj = parseDataChart(quotes);
          obj.empty = false;
        } else {
          obj.empty = true;
        }
        io.sockets.emit('chart', obj);
      });
    });
  });


  return router;
}