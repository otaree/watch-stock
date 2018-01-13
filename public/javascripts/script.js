$(document).ready(function () {
    // Make connection
    var socket = io.connect('http://localhost:3000');

    var lineChart;
    var add = $("#add");
    var close;

    function addStocksCard(stocks) {
        for (var i = 0; i < stocks.length; i++) {
            var card = '<div class="card float-left border border-dark stock ml-5 mt-5" style="width: 300px; height: 100px;" <div class="card-body" data-stock="';
            card += stocks[i] + '">';
            card += "<button class='close text-right' aria-label='Close' type='close' data-stock='" + stocks[i] + "'><span aria-hidden='true'>×</span></button>";
            card += '<h3 class="card-text p-3">';
            card += stocks[i] + "</h3>";

            card += ' </div></div>';
            $(".add-stock").before(card);
        }


    }


    // Emit chart signal for getting chart data
    function getStocks() {
        socket.emit("chart", {
            data: "get stock data"
        });
    }

    getStocks();

    $("body").on("click", ".close", function () {
        close = $(this);
        var stock = close.data("stock");
        close.prop("disabled", true);
        socket.emit('delete', {
            stock: stock
        });
    });


    // Emit add signal 
    add.on('click', function () {
        var stockName = $("input:text").val();
        add.prop("disabled", true);
        socket.emit('add', {
            stock: stockName
        });
    });

    //listen for events
    socket.on('chart', function (data) {
        $(".card").remove();
        $(".alert").remove();
        add.prop("disabled", false);
        if (close) {
            close.prop("disabled", false);
        }
        if (lineChart) {
            lineChart.destroy();
        }
        if (!data.empty) {
            addStocksCard(data.symbols);
            lineChart = new Chart(document.getElementById("line-chart"), {
                type: 'line',
                data: data.chartdata,
                options: {
                    responsive: false,
                    title: {
                        display: true,
                        text: 'Market'
                    }
                }
            });
        }

    });

    socket.on('message', function (data) {
        add.prop("disabled", false);
        $(".alert").remove();
        let alert = '<div class="alert alert-danger" role="alert">' + data.text + '</div>';
        $(".input-group").after(alert);
    });
});