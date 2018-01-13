var googleFinance = require('google-finance');

let date = require('date-and-time');

function parseQuotes(quotes, symbol) {
    let returnObj = {};
    let data = [];
    let date = [];
    let checkDate = '';
    for (let i = 0; i < quotes.length; i++) {
        if (quotes[i].close) {
            if (quotes[i].date.toString().split(" ")[1] !== checkDate) {
                data.push(quotes[i].close);
                date.push(quotes[i].date.toString());
                checkDate = quotes[i].date.toString().split(" ")[1];
            }

        }

    }
    returnObj.symbol = symbol;
    returnObj.data = data;
    returnObj.date = date;
    return returnObj;

}

function getQuotes(symbol) {
    return new Promise((resolve, reject) => {
        googleFinance.historical({
                symbol: 'NASDAQ:' + symbol,
                from: '2017-01-01',
                to: '2017-12-31'
            })
            .then((quotes) => {
                if (quotes.length > 0) {
                    resolve(parseQuotes(quotes,symbol));
                } else {
                    reject(null);
                }
            });
    });
}

module.exports = getQuotes;