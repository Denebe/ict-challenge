
function setForm(gte, lte) {
    var form = {
        "url": "http://125.187.189.59:9200/instagram-test-*/_search",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "query": {
                "bool": {
                    "must": {
                        "match": {
                            "location": $('#keyword').val(),
                        }
                    },
                    "filter": {
                        "range": {
                            "timestamp": {
                                "gte": gte,
                                "lte": lte
                            }
                        }
                    }
                }
            },
            "size": 500,
            "_source": ["timestamp", "location", "buzz"],
            "sort": {
                "timestamp": {
                    "order": "desc"
                }
            }
        })
    };
    return form;
}


function LineFitter() {
    this.count = 0;
    this.sumX = 0;
    this.sumX2 = 0;
    this.sumXY = 0;
    this.sumY = 0;
}

LineFitter.prototype = {
    'add': function (x, y) {
        this.count++;
        this.sumX += x;
        this.sumX2 += x * x;
        this.sumXY += x * y;
        this.sumY += y;
    },
    'project': function (x) {
        var det = this.count * this.sumX2 - this.sumX * this.sumX;
        var offset = (this.sumX2 * this.sumY - this.sumX * this.sumXY) / det;
        var scale = (this.count * this.sumXY - this.sumX * this.sumY) / det;
        return parseInt(offset + x * scale);
    }
};

function linearProject(data, x) {
    var fitter = new LineFitter();
    for (var i = 0; i < data.length; i++) {
        fitter.add(i, data[i].value);
    }
    return fitter.project(x);
}


var graph = Morris.Line({
    element: 'morris-one-line-chart',
    xkey: 'date',
    ykeys: ['value'],
    hideHover: 'auto',
    resize: true,
    lineWidth: 4,
    labels: ['Value'],
    lineColors: ['#1ab394'],
    pointSize: 5
});

function setChartData() {
    var base = 0;
    var startDate = moment($('#fromDate').val()).format('YYYY-MM-DD');
    var endDate = moment($('#toDate').val()).format('YYYY-MM-DD');
    var diff = moment(endDate).diff(startDate, 'day');
    var data = new Array;
    for (i = -7; i <= diff + 3; i++) {
        (
            function (i) {
                var gte = (moment(startDate + "T00:00:00.000Z").add(i, 'd'));
                var lte = (moment(startDate + "T00:00:00.000Z").add(i + 1, 'd'));
                var form = setForm(gte, lte);
                $.ajax(form)
                    .done(function (res) {
                        var dateInfo = moment(startDate).add(i, 'd').format('YYYY-MM-DD');
                        if (i >= diff) {
                            valueInfo = linearProject(data, 5);
                            if (valueInfo < 0) {
                                valueInfo = 0;
                            }
                            data.push({ date: dateInfo, value: valueInfo });
                            console.log(data)
                            if (i == diff + 3) {
                                //그래프 초기화
                                graph.setData(data);
                            }
                        } else {
                            var valueInfo = res.hits.hits.length;
                            data.push({ date: dateInfo, value: valueInfo });
                            if (i == 0) {
                                base = valueInfo;
                            }
                        }
                    })
                    .fail(function (xhr, status, errorThrown) {
                        console.log("xhr : ", xhr);
                        console.log("Status : ", status);
                        console.log("errorThrown : ", errorThrown);
                    })
            }(i)
        )
    }
}
