'use strict';
var app = angular.module('SolarCalculatorApp', ['nvd3', 'rzModule', 'ui.bootstrap']);

app.controller('solcarController', function ($rootScope, $scope, $timeout) {
    $scope.error = '';
    $scope.loanyear = '';
    $scope.formSubmitted = false;
    $scope.entryEmpty = true;
    var currBills = 0,
            reducedunits = 0,
            reducedbills = 0,
            interest = 0,
            principal = 0,
            totalmonths = 0,
            totalAmt = 0;
    $scope.selectedCity = '';


    $scope.locations = [{city: 'Banglore', rates: 5}, {city: 'Mumbai', rates: 7}, {city: 'Pune', rates: 9}];



    $scope.calculator = function () {
        if (!$scope.formSubmitted)
        {
            return;
        }
        else if ($scope.selectedCity === '' || $scope.units === undefined || $scope.roofsize === undefined)
        {
            $scope.error = 'All fields are required.';
            $scope.entryEmpty = true;

        }
        else
        {
            $scope.error = '';
            $scope.entryEmpty = false;
            $scope.solarsize = Math.min($scope.units / 120, $scope.roofsize / 100);
            $scope.solarsize = (Math.round($scope.solarsize * 100)) / 100;
            $scope.solarunits = Math.round($scope.solarsize * 4 * 30);
            $scope.solarcost = 75000 * $scope.solarsize;
            currBills = $scope.units * $scope.selectedCity.rates;
            reducedunits = Math.max($scope.units - $scope.solarunits, 0);
            reducedbills = reducedunits * $scope.selectedCity.rates;
            $scope.formSubmitted = true;

            $scope.sliderLoanAmt = {
                value: $scope.solarcost / 2,
                options: {
                    floor: 0,
                    ceil: (85 * $scope.solarcost) / 100,
                    step: 100,
                    showSelectionBar: true,
                    onChange: function () {
                        $scope.checkEmi();
                    },
                    onEnd: function () {
                        $scope.checkEmi();
                    }
                }
            };
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
                $rootScope.$broadcast('rzSliderForceRender');
                $scope.checkEmi();
            });

        }
    };

    $scope.submit = function () {
        if ($scope.selectedCity === '' || $scope.units === undefined || $scope.roofsize === undefined)
        {
            $scope.error = 'All fields are required.';
            $scope.formSubmitted = false;
        }
        else
        {
            $scope.error = '';
            $scope.formSubmitted = true;
            $scope.entryEmpty = false;
            $scope.calculator();
        }

    };

    $scope.checkEmi = function () {
        if ($scope.formSubmitted)
        {
            $scope.maxLoanAmt = (85 * $scope.solarcost) / 100;
            if ($scope.sliderLoanAmt.value > $scope.maxLoanAmt) //85% implement it - djain don't forget
            {
                $scope.error = 'Maximum Loan amount can be 85% of Solar SYstem cost';
            }
            else
            {
                $scope.error = '';
                $scope.loanyear = $scope.sliderLoanTenure.value;
                interest = ($scope.sliderLoanAmt.value * 11 * $scope.loanyear) / 100;
                principal = $scope.sliderLoanAmt.value;
                totalmonths = $scope.loanyear * 12;
                totalAmt = principal + interest;
                $scope.monemi = Math.round(totalAmt / totalmonths);
                $scope.monthlysavings = Math.round(currBills - reducedbills - $scope.monemi);
                $scope.data = feedDataInGraph();
            }
        }
    };


    $scope.sliderLoanTenure = {
        value: 6,
        options: {
            floor: 5,
            ceil: 7,
            step: 1,
            showSelectionBar: true,
            onChange: function () {
                $scope.checkEmi();
            },
            onEnd: function () {
                $scope.checkEmi();
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

        if ($scope.solarcost > 0)
        {
            var noSolar = 0,
                    solarNoLoan = $scope.solarcost,
                    solarAndLoan = $scope.solarcost - $scope.sliderLoanAmt.value;
            //Data is represented as an array of {x,y} pairs.
            for (var i = 0; i < 10; i++) {
                noSolar = i * currBills * 12;
                solarNoLoan = $scope.solarcost + i * reducedbills * 12;
                if (i <= $scope.loanyear)
                {
                    solarAndLoan = $scope.solarcost - $scope.sliderLoanAmt.value + i * (($scope.monemi * 12) + reducedbills * 12);
                }
                else
                {
                    solarAndLoan += reducedbills * 12;
                }

                if (noSolar >= 0 && solarNoLoan > 0 && solarAndLoan > 0)
                {
                    noSolarArr.push({x: i, y: noSolar});
                    solarNoLoanArr.push({x: i, y: solarNoLoan});
                    solarAndLoanArr.push({x: i, y: solarAndLoan});
                }

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
    }
    ;



});