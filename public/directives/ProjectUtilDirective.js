/**
 * Created by Xunrong Li on 7/14/15.
 * Directive for project bar chart on profile page
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .directive('projectUtil', projectUtil);

  projectUtil.$inject = [
    'D3Factory',
    'globalState',
    '$state',
    '$filter',
    '$timeout',
    '$compile',
    '$log',
    'PROJECT_COLORS',
    '$cookies'
  ];

  function projectUtil(
    D3Factory,
    globalState,
    $state,
    $filter,
    $timeout,
    $compile,
    $log,
    PROJECT_COLORS,
    $cookies
  ) {
    var directive = {
      link: link
    };
    return directive;

    function link(scope, element) {
      var g = globalState;
      var s = scope;

      var width;
      var height;
      var svg;
      var xAxisSvg;
      var xScale;
      var yScale;
      var xAxis;
      var yAxis;

      // setting the size of svg
      var margins = {
        top: 0,
        left: 55,
        right: 55,
        bottom: 20
      };

      var fillColors;
      var projects;
      var dateRange;
      var dataSet;
      var todayPosition;
      var oldW;

      g.availableColors = angular.copy(PROJECT_COLORS);

      D3Factory.d3().then(function (d3) {
        // Watch the width of main-content div to see if it changes
        s.$watch(function () {
          return element[0].clientWidth;
        }, function () {
          if (s.profileVM.person.projects && s.profileVM.person.projectlength > 0) {
            angular.forEach(s.profileVM.person.projects, function (value) {
              var proj = value;
              proj.utilization = $filter('orderBy')(proj.utilization, ['start_date']);
            });
            resize(s.profileVM.person.projects);
          }
        });

        s.$on('redrawChart', function () {
          var chart = element[0].querySelector('.project-util-container');
          var wrappedChart = angular.element(chart);
          var axis = element[0].querySelector('.chart-x-axis');
          var wrappedAxis = angular.element(axis);

          wrappedAxis.empty();
          wrappedChart.empty();

          if (!angular.equals(s.profileVM.person.projects, g.userProfile.projects)) {
            s.profileVM.person.projects = g.userProfile.projects;
          }

          if (s.profileVM.person.projects && s.profileVM.person.projects.length > 0) {
            $timeout(function () {
              angular.forEach(s.profileVM.person.projects, function (value) {
                var proj = value;
                proj.utilization = $filter('orderBy')(proj.utilization, ['start_date']);
              });
              init(s.profileVM.person.projects);
            });
          }
        });

        if (s.profileVM.person.projects && s.profileVM.person.projects.length > 0) {
          g.currentUtil = s.profileVM.person.projects;
          angular.forEach(s.profileVM.person.projects, function (value) {
            var proj = value;
            proj.utilization = $filter('orderBy')(proj.utilization, ['start_date']);
          });
          init(s.profileVM.person.projects);
        }

        function renderBarChart(data, initial) {
          var projContainterWidth;
          var barNumber;
          var ChartDataSet;
          var stack;
          var chartDataSet;

          if (!data) {
            $log.error('can not get projects');
            return;
          }

          // get the width of the project container
          projContainterWidth = $('.col.projects').width();
          width = projContainterWidth - margins.left - margins.right;

          /*
           dataSet - store formatted data for bar chart
           dateRange - two-element array to store the start date and end date of the bar chart
           first element is the start date,
           second element is the end date
           */

          // clean the existed data
          dateRange = findDateRange(data);
          dataSet = formatDate(data, dateRange[0], dateRange[1]);

          // setting the height of the bar chart svg based on the number of days
          barNumber = dataSet[0].utilization.length;
          height = barNumber * 24;

          // store projects id for mapping colors
          projects = dataSet.map(function (d) {
            return d.id;
          });

          fillColors = d3.scale.ordinal()
            .domain(projects)
            .range(PROJECT_COLORS);

          // create data set for actual chart bar use
          ChartDataSet = dataSet.map(function (d) {
            return d.utilization.map(function (o) {
              // Structure it so that your numeric
              // axis (the stacked amount) is y
              return {
                y: o.percentage,
                x: o.date,
                id: o.projID,
                name: o.name
              };
            });
          });

          // create stack layout and populate using dataSet
          stack = d3.layout.stack();
          stack(ChartDataSet);

          chartDataSet = ChartDataSet.map(function (group) {
            return group.map(function (d) {
              // Invert the x and y values, and y0 becomes x0
              return {
                x: d.y, // percentage/width
                y: d.x, // y position
                x0: d.y0, // x position
                id: d.id,
                name: d.name
              };
            });
          });

          if (initial) {
            start(chartDataSet);
          } else {
            resizeChart();
          }
        }

        function start(data) {
          var xMax;
          var dates;
          var groups;
          var rects;
          var borders;

          svg = d3.select('.project-util-container')
            .append('svg')
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top)
            .append('g')
            .attr('id', 'project-util-svg')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

          // the svg for x axis with fixed position
          xAxisSvg = d3.select('.chart-x-axis')
            .append('svg').attr('width', width + margins.left + margins.right)
            .attr('height', margins.bottom)
            .append('g')
            .attr('transform', 'translate(' + margins.left + ',0)');

          // max value for x axis
          xMax = d3.max(data, function (group) {
            return d3.max(group, function (d) {
              return parseInt(d.x, 10) + parseInt(d.x0, 10);
            });
          });

          // get dates for y axis
          dates = data[0].map(function (d) {
            return d.y;
          });

          // mapping value and width of x axis
          xScale = d3.scale.linear()
            .domain([0, xMax])
            .range([0, width]);

          // mapping value and height of x axis
          yScale = d3.scale.ordinal()
            .domain(dates)
            // evenly divide a space up for you into bands across the range (round to integers)
            // second param is the padding between bars
            .rangeRoundBands([0, height], 0.0000001);

          xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickValues(setTickValues(xMax))
            .tickFormat(function (d) {
              return d + '%';
            });

          yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

          // each project is a group and has its own color
          groups = svg.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .style('fill', function (d, i) {
              if (!g.projectColorMapping[d[0].id]) {
                var index = g.availableColors.indexOf(fillColors(i));
                if (index >= 0) {
                  g.availableColors.splice(index, 1);
                }
                g.projectColorMapping[d[0].id] = fillColors(i);
                return fillColors(i);
              }
              return g.projectColorMapping[d[0].id];
            });

          rects = groups.selectAll('rect');

          rects
            .data(function (d) {
              // data set to be the elements in the groups i.e daily utilization
              return d;
            })
            .enter()
            .append('rect')
            .attr('x', function (d) {
              return xScale(d.x0);
            })
            .attr('y', function (d) {
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; // January is 0!
              var yy = today.getYear() - 100;

              today = mm + '/' + dd + '/' + yy;

              if (d.y === today) {
                todayPosition = yScale(d.y);
              }

              return yScale(d.y);
            })
            .attr('height', function () {
              return yScale.rangeBand() + 1;
            })
            .attr('width', function (d) {
              return xScale(d.x);
            })
            .attr('class', function (d) {
              // mark the today rects to highlight them
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; // January is 0!
              var yy = today.getYear() - 100;
              var returnString;

              today = mm + '/' + dd + '/' + yy;

              if (d.y === today) {
                returnString = 'bars today';
              } else {
                returnString = 'bars';
              }

              return returnString;
            })
            .attr('projectID', function (d) {
              return d.id;
            })
            .on('click', function (d) {
              var myManager = $cookies.get('myManager');
              g.fromProfile = true;

              $state.go('home.projects.projectDetail', {
                projectID: d.id,
                filter: 'today',
                manager: myManager
              });
            })
            .append('title').text(function (d) {
              return d.name;
            });

          // creating lines as borders between bars (only top)
          borders = groups.selectAll('line');

          borders
            .data(function (d) {
              return d;
            })
            .enter()
            .append('line')
            .attr('x1', function (d) {
              return xScale(d.x0);
            })
            .attr('y1', function (d) {
              return yScale(d.y);
            })
            .attr('x2', function (d) {
              return xScale(d.x0) + xScale(d.x);
            })
            .attr('y2', function (d) {
              return yScale(d.y);
            })
            .attr('class', 'borders')
            .attr('stroke', 'black')
            .attr('stroke-width', '1')
            // set length to be 1 and gap to be 3 and create dash border
            .attr('stroke-dasharray', '1, 3');

          // fill brighter color for today's rects
          d3.selectAll('rect.bars.today').attr('fill', function (d) {
            return d3.rgb(globalState.projectColorMapping[d.id]).brighter();
          });

          xAxisSvg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0, 0)')
            .call(xAxis);

          svg.append('g')
            .attr('class', 'axis')
            .call(yAxis);

          setTodayLabel();
          setLegendColors();
          scrollToToday(dateRange[1]);

          oldW = width;
        }


        function resizeChart() {
          if (!oldW) {
            $log.error('forget to initialize before resizing');
            return;
          }

          // update width
          // get the width of the project container
          width = $('.col.projects').width();
          width = width - margins.left - margins.right;

          // reset x range
          xScale.range([0, width]);

          d3.select(svg.node().parentNode)
            .attr('height', (yScale.rangeExtent()[1] + margins.top) + 'px')
            .attr('width', (width + margins.left + margins.right) + 'px');

          svg.selectAll('rect.bars')
            .attr('width', function (d) {
              return xScale(d.x);
            })
            .attr('x', function (d) {
              return xScale(d.x0);
            });

          svg.selectAll('line.borders')
            .attr('x1', function (d) {
              return xScale(d.x0);
            })
            .attr('x2', function (d) {
              return xScale(d.x0) + xScale(d.x);
            });

          // update axes
          d3.select(xAxisSvg.node().parentNode)
            .attr('width', (width + margins.left + margins.right) + 'px');

          xAxisSvg.call(xAxis);
        }

        function findDateRange(data) {
          // minStart and maxEnd are the earliest start date
          // and latest end date for all the project utilization
          var minStart;
          var maxEnd;
          var utilLength;
          var utilHead;
          var utilTail;
          var ms;
          var me;
          var i;

          // find out the earliest start date and latest end date
          for (i = 0; i < data.length; i++) {
            utilLength = data[i].utilization.length;
            utilHead = data[i].utilization[0];
            utilTail = data[i].utilization[utilLength - 1];

            if (!minStart || minStart > utilHead.start_date) {
              minStart = utilHead.start_date;
            }
            if (!maxEnd || maxEnd < utilTail.end_date) {
              maxEnd = utilTail.end_date;
            }
          }

          ms = new Date(minStart);
          ms = new Date(ms.setDate(ms.getDate() - 1));

          me = new Date(maxEnd);
          me = new Date(me.setDate(me.getDate() + 1));

          return [ms.getTime(), me.getTime()];
        }

        function formatDate(data, minStart, maxEnd) {
          var formattedData = [];
          var utilPerDay;
          var obj;

          // first loop declarations
          var utilCurrent;
          var currentStart;
          var currentEnd;
          var currentPercentage;

          // second loop declerations
          var beginning;
          var end;

          // while declerations
          var theDate;
          var thePercentage;
          var newDate;

          // itertators
          var i;
          var j;
          var key;

          for (i = 0; i < data.length; i++) {
            utilPerDay = [];
            obj = {};

            for (j = 0; j < data[i].utilization.length; j++) {
              utilCurrent = data[i].utilization[j];

              currentStart = new Date(utilCurrent.start_date);
              currentEnd = new Date(utilCurrent.end_date);

              currentPercentage = utilCurrent.percentage;

              beginning = new Date(minStart);
              end = new Date(maxEnd);

              while (beginning <= end) {
                // get the date
                theDate = beginning.setDate(beginning.getDate());

                if (theDate < currentStart || theDate > currentEnd) {
                  thePercentage = 0;
                } else {
                  thePercentage = currentPercentage;
                }

                theDate = $filter('date')(theDate, 'M/d/yy');

                if (obj[theDate]) {
                  obj[theDate].percentage = obj[theDate].percentage + thePercentage;
                } else {
                  obj[theDate] = {
                    date: theDate,
                    percentage: thePercentage,
                    projID: data[i].proj_id,
                    name: data[i].name
                  };
                }

                // add one day
                newDate = beginning.setDate(beginning.getDate() + 1);
                beginning = new Date(newDate);
              }
            }

            for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                utilPerDay.push(obj[key]);
              }
            }
            formattedData[i] = {
              utilization: utilPerDay,
              name: data[i].name,
              id: data[i].proj_id
            };
          }
          return formattedData;
        }


        function setTickValues(max) {
          var values = [];
          var i;
          for (i = 0; i * 25 <= max - 15; i++) {
            values.push(i * 25);
          }
          values.push(max);
          return values;
        }

        function setLegendColors() {
          $('.legend-box').each(function () {
            var id = $(this).attr('id');
            $(this).css('background-color', globalState.projectColorMapping[id]);
          });
        }

        function setTodayLabel() {
          // changet it to today
          var todayLabel;
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth() + 1; // January is 0!
          var yy = today.getFullYear();
          yy = yy.toString().substr(2, 2);

          todayLabel = $('g text').filter(function () {
            return $(this).text() === mm + '/' + dd + '/' + yy;
          });

          todayLabel.text('Today');
          todayLabel.css({
            'font-weight': 'bold',
            'font-size': '0.65rem'
          });
        }

        function scrollToToday() {
          var outerHeight = $('.project-util-container').outerHeight() / 2;
          $('.project-util-container').scrollTop(todayPosition - outerHeight);
        }

        function init(_data) {
          renderBarChart(_data, true);
        }

        function resize(_data) {
          renderBarChart(_data, false);
        }
      });
    }
  }
}());
