'use strict';
var app = angular.module('SolarCalculatorApp', ['nvd3', 'rzModule', 'ui.bootstrap']);

app.controller('solcarController', function ($scope) {
    $scope.error = '';
    $scope.loanyear = '';
    $scope.formSubmitted = false;
    var currBills = 0,
            reducedunits = 0,
            reducedbills = 0,
            interest = 0,
            principal = 0,
            totalmonths = 0,
            totalAmt = 0;
    $scope.selectedCity = '';


    $scope.locations = [{city: 'Banglore', rates: 5}, {city: 'Mumbai', rates: 7}, {city: 'Pune', rates: 9}];




    $scope.submit = function () {
        $scope.solarsize = Math.min($scope.units / 120, $scope.roofsize / 100);
        $scope.solarunits = $scope.solarsize * 4 * 30;
        $scope.solarcost = 75000 * $scope.solarsize;
        currBills = $scope.units * $scope.selectedCity.rates;
        reducedunits = Math.max($scope.units - $scope.solarunits, 0);
        reducedbills = reducedunits * $scope.selectedCity.rates;
        $scope.formSubmitted = true;
    };

    $scope.checkMaxLoan = function () {
        $scope.maxLoanAmt = (85 * $scope.solarcost) / 100;
        if ($scope.loanamt > $scope.maxLoanAmt) //85% implement it - djain don't forget
        {
            $scope.error = 'Maximum Loan amount can be 85% of Solar SYstem cost';
        }
        else
        {
            $scope.error = '';
            $scope.loanyear = $scope.slider_floor_ceil.value;
            interest = ($scope.loanamt * 11 * $scope.loanyear) / 100;
            principal = $scope.loanamt;
            totalmonths = $scope.loanyear * 12;
            totalAmt = Number(principal) + Number(interest);
            $scope.monemi = totalAmt / totalmonths;
            $scope.monthlysavings = currBills - reducedbills - $scope.monemi;
            $scope.data = feedDataInGraph();
        }
    };

    //slider
    $scope.slider_floor_ceil = {
        value: 6,
        options: {
            floor: 5,
            ceil: 7,
            step: 1,
            onEnd: function () {
                $scope.checkMaxLoan();
            }
        }
    };

//chart details
    $scope.options = {
        chart: {
            type: 'lineChart',
            height: 450,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) {
                return d.x;
            },
            y: function (d) {
                return d.y;
            },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function (e) {
                    console.log("stateChange");
                },
                changeState: function (e) {
                    console.log("changeState");
                },
                tooltipShow: function (e) {
                    console.log("tooltipShow");
                },
                tooltipHide: function (e) {
                    console.log("tooltipHide");
                }
            },
            xAxis: {
                axisLabel: 'Time (years)'
            },
            yAxis: {
                axisLabel: 'Cash outflow on Electricity (Rs)',
                tickFormat: function (d) {
                    return d3.format('100')(d);
                    //return d3.format('.02f')(d);
                },
                axisLabelDistance: -100
            },
            callback: function (chart) {
               // console.log("!!! lineChart callback !!!");
            }
        },
        title: {
            enable: true,
            text: 'cash-outflow graph'
        },
        subtitle: {
            enable: true,
            text: 'Amount spent vs time progressing',
            css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
            }
        }

    };



    /*Random Data Generator */
    function feedDataInGraph() {
        var noSolarArr = [], solarNoLoanArr = [], solarAndLoanArr = [];

        var noSolar = 0,
                solarNoLoan = Number($scope.solarcost),
                solarAndLoan = Number($scope.solarcost) - Number($scope.loanamt);
        //Data is represented as an array of {x,y} pairs.
        for (var i = 0; i < 10; i++) {
            noSolar = i * currBills * 12;
            solarNoLoan = Number($scope.solarcost) + i * Number(reducedbills * 12);
            if (i <= $scope.loanyear)
            {
                solarAndLoan = Number($scope.solarcost) - Number($scope.loanamt) + i * (Number($scope.monemi * 12) + Number(reducedbills * 12));
            }
            else
            {
                solarAndLoan += Number(reducedbills * 12);
            }
            noSolarArr.push({x: i, y: noSolar});
            solarNoLoanArr.push({x: i, y: solarNoLoan});
            solarAndLoanArr.push({x: i, y: solarAndLoan});

        }

        //Line chart data should be sent as an array of series objects.
        return [
            {
                values: noSolarArr,
                key: 'No Solar, just electricity bills',
                color: '#ff7f0e'
//                    key: 'Another sine wave',
//                    color: '#7777ff',
//                    area: true      //area - set to true if you want this line to turn into a filled area chart.
            },
            {
                values: solarNoLoanArr,
                key: 'Solar without loan',
                color: '#0000FF'
            },
            {
                values: solarAndLoanArr,
                key: 'Solar with Oorjan Loan',
                color: '#008000'
            }
        ];
    }
    ;


});