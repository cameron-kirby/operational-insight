/**
 * Created by Xunrong Li on 6/25/15.
 * Customized Directive: Bubble Chart <bubble-chart></bubble-chart>
 */
ResrcUtilApp.directive('bubbleChart', bubbleChart);

bubbleChart.$inject = [
  'D3Factory',
  'globalState',
  '$window',
  '$cookies',
  '$log',
  '$state',
  '$rootScope',
  '$stateParams',
  'REST_URL',
  'SKILL_COLORS',
  'utilities'
];

function bubbleChart(D3Factory,
  globalState,
  $window,
  $cookies,
  $log,
  $state,
  $rootScope,
  $stateParams,
  REST_URL,
  SKILL_COLORS,
  utilities) {
  var directive = {
    link: linkFunction,
    restrict: 'EA'
  };

  return directive;

  function linkFunction(scope, element) {
    D3Factory.d3().then(function (d3) {
      var g = globalState;
      var rootScope = $rootScope;
      var svg;

      // Detect state change event
      scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState) {
        if (toState.name === 'home.skills') {
          g.currentView.name = 'Skills';
          /*
           g.isSkillDetailView - main the state whether is project detail or now
           so that BubbleChartController and SkillDetailController can both access to
           scope.isSkillDetailView -  use to control the view (back arrow and detail data)
           */
          if (scope.data) {
            scope.customBubbleChart.toBubbleChart(scope.data);
          }
        } else if (toState.name === 'home.skills.detail') {
          if (fromState.name === 'home.skills') {
            scope.customBubbleChart.toSkillDetail(toParams.skillID, 1000);
          } else {
            scope.goToSkillDirectly = true;
            scope.customBubbleChart.toSkillDetail(toParams.skillID, 1);
          }
        }
      });

      scope.$on('changeTab', function (event, data) {
        scope.changeTab(data);
      });

      // Choose all/categorized skills tabs
      scope.changeTab = function (tab) {
        scope.tab = tab;
        scope.customBubbleChart.toggleView(tab);
        return false;
      };

      scope.$on('changeTeam', function () {
        $stateParams.manager = $cookies.get('myManager');
        $state.go('home.skills', {
          manager: $stateParams.manager
        });
      });

      getSkillsData();

      // Send http request to get projects data
      function getSkillsData() {
        var manager = utilities.syncManager($stateParams.manager);

        declareVariables();

        rootScope.bubbleChartLoading = true;

        d3.json(REST_URL.hostname + REST_URL.baseUrl + 'skills?view=chart&manager=' + manager)
          .header('x-access-token', $cookies.get('myToken'))
          .get(function (error, data) {
            var filtertedData = {};

            rootScope.bubbleChartLoading = false;

            if (error && error.status === 401) {
              $cookies.remove('myToken');
              $cookies.remove('myID');
              $cookies.remove('myName');
              $cookies.remove('myUserRole');
              $state.go('login');
            }

            filtertedData.kind = data.kind;
            filtertedData.items = data.items;

            g.filteredBubbleData = filtertedData;
            rootScope.$broadcast('updateFilteredBubbleData');

            scope.categoryObjs = data.categories;
            rootScope.categoryObjs = scope.categoryObjs;

            scope.data = filtertedData;
            if (scope.data.items.length > 0) {
              scope.customBubbleChart.init(scope.data);
              scope.customBubbleChart.toggleView('all');
            }
          });
      }

      // Set the svg location and width
      svg = d3.select('.map-body').append('svg')
        .attr('id', 'svg_vis')
        .style('opacity', '0');

      // Watch the width of main-content div to see if it changes
      scope.$watch(function () {
        return element[0].clientWidth;
      }, function () {
        scope.customBubbleChart.resize(scope.data);
      });

      function declareVariables() {
        scope.categoryObjs = [];
        rootScope.categoryObjs = scope.categoryObjs;

        scope.customBubbleChart = initializeD3();
      }

      /*
       the position and setting of the force layout
       w - width of the map
       h - height of the map
       colorSet - customized color sets
       layoutGravity - the force that can push nodes towards the center of the layout
       damper - the factor to damper the effect
       nodes - the set to store each skill object
       center - the center object
       categoryCenters - the centers of all categories
       */
      function initializeD3() {
        var w;
        var h;
        var layoutGravity = -0.01;
        var damper = 0.1;
        var center;
        var categoryCenters = {};
        var categoryRow = {};
        var isCategory = false;
        var categoryIDs = [];
        var categoryLabels = {};
        var groups;
        var circles;
        var radiusScale;
        var maxX = 0;
        var maxY = 0;
        var minX = 0;
        var minY = 0;
        var myMod;
        var height;
        var width;
        var newHeight;
        var newWidth;
        var initialWidth;
        var initialHeight;
        var force;

        // Select the container for the width of the Tree map
        var container = $('.map-body');
        initialWidth = container.width();
        initialHeight = container.height();

        // d3 force layout
        force = d3.layout.force();

        function endall() {
          height = Math.abs(maxY - minY) + 100;
          width = Math.abs(maxX - minX) + 100;

          if (w > width) {
            // use container width
            svg.style('width', w + 'px');
            center.x = w / 2;
            container[0].scrollLeft = (w - width) / 2;
          } else {
            // use svg width
            svg.style('width', width + 'px');
            center.x = width / 2;
            container[0].scrollLeft = (width - w) / 2;
          }

          if (h > height) {
            // use container height
            svg.style('height', h + 'px');
            // svg.style("height", "100%");
            center.y = h / 2;
            container[0].scrollTop = (h - height) / 2;
          } else {
            // use svg height
            svg.style('height', height + 'px');
            center.y = height / 2;
            container[0].scrollTop = (height - h) / 2;
          }

          setTimeout(function () {
            svg.transition().duration(1000).style('opacity', '1');
          }, 500);
        }

        /*
         Render the Bubble Chart
         data - project data for bubbles
         initial - initialize the chart or resize it
         */
        function renderChart(data, initial) {
          var maxAmount;
          var node;
          var num;

          if (!data) {
            $log.warn('passing empty data or haven\'t received data');
            return;
          }

          // Setting the position of the bubble chart
          w = container.width();
          h = container.height();

          // Get the center of the chart
          center = {
            x: w / 2,
            y: h / 2
          };

          // Get and setting category and its centers
          getCategoryCenters(data.items);

          // Set the scale of the radius based on the number of people who have the skill
          maxAmount = d3.max(data.items, function (d) {
            return parseInt(d.skill_in_manager, 10);
          });

          radiusScale = d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([3, w / 20]);

          // Set force layout size
          force.size([w, h]);

          if (initial) {
            // Initialize the map
            start(data);
          } else {
            /*
             two situations:
             1. already zoom-in to detail page, just call zoom function
                to resize it without transition animation.
             2. before zoom-in, just set own resize scale.
             */
            if (g.isSkillDetailView) {
              node = findNodeByID($stateParams.skillID);
              if (scope.goToSkillDirectly) {
                if (node === undefined) { // save the node, if it is not treemap
                  if (g.nodesNotInBubbleChart[$stateParams.skillID] === undefined) {
                    // Find a random project from the projects
                    num = Math.floor((Math.random() * (scope.data.items.length - 1) + 1));
                    node = findNodeByID(scope.data.items[num]._id);
                    g.nodesNotInBubbleChart[$stateParams.skillID] = node;
                  } else {
                    node = g.nodesNotInBubbleChart[$stateParams.skillID];
                  }
                }
              } else {
                node = scope.zoomedNode;
              }
              zoom(node, 1);
            } else {
              resizeChart();
            }
          }
        }

        /*
         get the positions for each category
         categories - the categories set from the response
         */
        function getCategoryCenters(data) {
          var c;
          var cLength;
          var i;
          var j;
          var k;
          var r;
          var row;
          var splitX;
          var splitx;
          var splity;

          for (i = 0; i < data.length; i++) {
            if (categoryIDs.indexOf(data[i].category_id) === -1) {
              categoryIDs.push(data[i].category_id);
              categoryLabels[data[i].category_id] = data[i].category;
            }
          }

          // Get and setting category and its centers
          cLength = categoryIDs.length;

          if (cLength <= 4) {
            for (j = 0; j < cLength; j++) {
              splitX = w * (j + 1) / (cLength + 1);
              categoryRow[categoryIDs[j]] = 1;

              categoryCenters[categoryIDs[j]] = {
                x: splitX + (w / 2 - splitX) / (cLength),
                y: h / 2
              };
            }
          } else if (cLength > 4) {
            row = Math.ceil(cLength / 4) + 1;
            for (k = 0; k < cLength; k++) {
              r = Math.ceil((k + 1) / 4);
              c = (k + 1) % 4 === 0 ? 4 : (k + 1) % 4;
              splitx = w * c / 5;
              splity = h * r / row;

              categoryRow[categoryIDs[k]] = r;

              categoryCenters[categoryIDs[k]] = {
                x: splitx + (w / 2 - splitx) / 5,
                y: splity + (h / 2 - splity) / 5
              };
            }
          }
        }

        // Get the row of the bubble according to the category
        function getRow(categoryID) {
          return categoryRow[categoryID];
        }

        // Initialize the Bubble Chart
        function start(data) {
          var fillColor;
          var n;
          var node;
          var num;

          $log.info('start the bubble chart');
          scope.nodes = [];

          // Set the zoomed node to be null
          scope.zoomedNode = null;

          // remove all previous items before render
          svg.selectAll('*').remove();

          /*
           create node objects from original data that will serve as the data behind each
           bubble in the svg, then add each node to nodes to be used later
           */
          data.items.forEach(function (d) {
            node = {
              id: d._id,
              radius: radiusScale(parseInt(d.skill_in_manager, 10)),
              value: d.skill_in_manager,
              name: d.name,
              category: d.category,
              categoryID: d.category_id,
              isTrending: d.trending,
              x: Math.random() * w,
              y: Math.random() * h,
              r: getRow(d.category_id)
            };

            scope.nodes.push(node);
          });


          // Sort the nodes based on the value, so the bubble with smaller will be on the top
          scope.nodes.sort(function (a, b) {
            return b.value - a.value;
          });

          force.nodes(scope.nodes);

          // Create a set of groups to contain circles and texts
          groups = svg.selectAll('.circle')
            .data(scope.nodes)
            .enter()
            .append('g')
            .attr('class', function (d) {
              return d.isTrending ? 'cell cell-trending' : 'cell';
            })
            .attr('id', function (d) {
              return 'bubble_' + d.id;
            })
            .attr('transform', function (d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            })
            .on('click', function (d) {
              if (!scope.isSkillDetailView) {
                scope.zoomedNode = d;
                $state.go('home.skills.detail', {
                  skillID: d.id
                });
                g.isDetail = true;
                rootScope.$broadcast('updateisDetail');
              }
            });

          groups.append('title')
            .text(function (d) {
              return d.value + ' user(s) know ' + d.name;
            });

          fillColor = setColorMapping();

          // Append circles
          circles = groups.append('circle')
            .attr('r', 0)
            .attr('fill', function (d) {
              if (g.skillColorMapping[d.categoryID] === undefined) {
                g.skillColorMapping[d.categoryID] = fillColor(d.categoryID);
              }

              return g.skillColorMapping[d.categoryID];
            })
            .attr('stroke-width', 1)
            .attr('stroke', function (d) {
              return d3.rgb(g.skillColorMapping[d.categoryID]).darker();
            });

          n = 0;
          circles
            .each(function () {
              n++;
            })
            .transition()
            .duration(500)
            .attr('r', function (d) {
              return d.radius;
            })
            .each('end', function (d) {
              if ((d.x + d.radius) > maxX) {
                maxX = (d.x + d.radius);
              }

              if ((d.x - d.radius) < minX) {
                minX = (d.x - d.radius);
              }

              if ((d.y + d.radius) > maxY) {
                maxY = (d.y + d.radius);
              }

              if ((d.y - d.radius) < minY) {
                minY = (d.y - d.radius);
              }

              n--;
              if (!n) {
                endall();
              }
            });


          // Append and display skill overview information (name, number of people)
          displaySkillInfo(groups);

          // If go to the skill detail directly
          if (scope.goToSkillDirectly) {
            node = findNodeByID($stateParams.skillID);

            if (node === undefined) {
              num = Math.floor((Math.random() * (scope.data.items.length - 1) + 1));
              node = findNodeByID(scope.data.items[num]._id);
              g.nodesNotInBubbleChart[$stateParams.skillID] = node;
            }
            goToSkillDetail(node, 1);
          }
        }

        /*
         create new scale based on the previous and current width/height
         oldW - the previous width before resizing
         oldH - the previous height before resizing
         */
        function resizeChart() {
          var currentHeight;
          var currentWidth;
          // make sure the tick ends before changing the layout
          force.stop();

          // for category view, change the horizontal position of the groups and labels
          currentWidth = container.width();
          currentHeight = container.height();

          if (currentWidth > initialWidth || currentHeight > initialHeight) {
            if (currentWidth > width) {
              svg.style('width', currentWidth + 'px');
              center.x = currentWidth / 2;
              container[0].scrollLeft = (currentWidth - w) / 2;
            } else {
              svg.style('width', width + 'px');
              center.x = width / 2;
              container[0].scrollLeft = (width - w) / 2;
            }

            if (scope.toggleView === 'category') {
              if (currentHeight > newHeight) {
                svg.style('height', currentHeight + 'px');
                center.y = currentHeight / 2;
                container[0].scrollTop = (currentHeight - newHeight) / 2;
              } else {
                svg.style('height', newHeight + 'px');
                center.y = newHeight / 2;
                container[0].scrollTop = (newHeight - h) / 2;
              }
            } else {
              if (currentHeight > height) {
                svg.style('height', currentHeight + 'px');
                center.y = currentHeight / 2;
                container[0].scrollTop = (currentHeight - h) / 2;
              } else {
                svg.style('height', height + 'px');
                center.y = height / 2;
                container[0].scrollTop = (height - h) / 2;
              }
            }
          } else {
            if (scope.toggleView === 'category') {
              if (currentWidth > newWidth) {
                // use container width
                svg.style('width', currentWidth + 'px');
                center.x = currentWidth / 2;
                container[0].scrollLeft = (currentWidth - newWidth) / 2;
              } else {
                // use svg width
                svg.style('width', newWidth + 'px');
                center.x = newWidth / 2;
                container[0].scrollLeft = (newWidth - currentWidth) / 2;
              }

              if (currentHeight > newHeight) {
                // use container height
                svg.style('height', currentHeight + 'px');
                center.y = currentHeight / 2;
                container[0].scrollTop = (currentHeight - newHeight) / 2;
              } else {
                // use svg height
                svg.style('height', newHeight + 'px');
                center.y = newHeight / 2;
                container[0].scrollTop = (newHeight - currentHeight) / 2;
              }
            } else {
              if (w > width) {
                // use container width
                svg.style('width', currentWidth + 'px');
                center.x = currentWidth / 2;
                container[0].scrollLeft = (currentWidth - width) / 2;
              } else {
                // use svg width
                svg.style('width', width + 'px');
                center.x = width / 2;
                container[0].scrollLeft = (width - currentWidth) / 2;
              }

              if (currentHeight > height) {
                // use container height
                svg.style('height', currentHeight + 'px');
                center.y = currentHeight / 2;
                container[0].scrollTop = (currentHeight - height) / 2;
              } else {
                // use svg height
                svg.style('height', height + 'px');
                center.y = height / 2;
                container[0].scrollTop = (height - currentHeight) / 2;
              }
            }
          }

          if (scope.toggleView === 'category') {
            displayByCategory();
          }

          if (g.isSkillDetailView === true) {
            svg.style('height', currentHeight + 'px');
            svg.style('width', currentWidth + 'px');
          }

          force.start();
        }

        function setColorMapping() {
          var categories = categoryIDs.slice();
          var colorIndex;
          var colorSet = SKILL_COLORS;
          var fillColor;
          var index;
          var key;

          if (Object.keys(g.skillColorMapping).length > 0) {
            for (key in g.skillColorMapping) {
              index = categories.indexOf(key);
              if (index !== -1) {
                categories.splice(index, 1);
                colorIndex = colorSet.indexOf(g.skillColorMapping[key]);
                colorSet.splice(colorIndex, 1);
              }
            }
          }

          // Map the categories with color sets
          fillColor = d3.scale.ordinal()
            .domain(categories)
            .range(colorSet);
          return fillColor;
        }

        angular.forEach(g.skillColorMapping, function (color, index) {
          var category = $.grep(scope.categoryObjs, function (e) {
            return e.id === index;
          });
          if (category && category.length === 1) {
            category[0].color = color;
          }
        });

        /*
         display skill overview information (name, number of people)
         groups - the g element that displays the info
         */
        function displaySkillInfo(groups) {
          var texts = groups.append('text')
            .attr('x', 0)
            .attr('y', '.3em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .style('opacity', '0');

          texts.append('svg:tspan')
            .attr('x', 0)
            .attr('dy', -20)
            .attr('font-size', '1.1rem')
            .text(function (d) {
              return (d.radius > 35) ? d.value : '';
            });

          texts.append('svg:tspan')
            .attr('x', 0)
            .attr('dy', function (d) {
              return (d.radius > 35) ? 25 : 0;
            })
            .attr('font-size', '0.8rem')
            .text(function (d) {
              var string = d.name.substring(0, d.radius / 5);
              var value;

              if (string.length === d.name.length) {
                value = string;
              } else {
                value = d.name.substring(0, d.radius / 7) + '...';
              }

              return value;
            });

          texts.append('svg:tspan')
            .attr('font-family', 'Ionicons')
            .attr('font-size', '0.7rem')
            .attr('x', 0)
            .attr('dy', 20)
            .attr('fill', 'white')
            .text(function (d) {
              return (d.radius > 35) ? '\uf262' : '';
            });

          texts.transition()
            .duration(3000)
            .style('opacity', '1');
        }

        // Evaluate each node and set charge dynamically
        function charge(d) {
          return -Math.pow(d.radius, 2.0) / 6;
        }

        // Configure and startup the force directed simulation:
        function displayGroupAll() {
          isCategory = false;

          endall();

          force.gravity(layoutGravity)
            .charge(charge)
            // Enough friction to prevent scattering away
            .friction(0.9)
            /*
             * The position of each node is determined by the function called
             * for each tick of the simulation. This function gets passed in
             * the tick event, which includes the alpha for this iteration of
             * the simulation.
             */
            .on('tick', function (e) {
              groups.each(moveTowardsCenter(e.alpha))
                .attr('transform', function (d) {
                  return 'translate(' + d.x + ',' + (d.y + 25) + ')';
                });
            });
          force.start();
          hideCategory();
        }

        // Define the move pace to the center
        function moveTowardsCenter(alpha) {
          return function (d) {
            // Dampened by damper and alpha
            var data = d;
            data.x = data.x + (center.x - data.x) * (damper + 0.02) * alpha * 0.7;
            data.y = data.y + (center.y - data.y) * (damper + 0.02) * alpha;
          };
        }

        // Display by category
        function displayByCategory() {
          var minx = 0;
          var miny = 0;
          var maxx = 0;
          var maxy = 0;
          var count = 0;

          isCategory = true;

          force.gravity(layoutGravity)
            .charge(charge)
            .friction(0.9)
            .on('tick', function (e) {
              var localMaxX = 0;
              var localMaxY = 0;
              var localMinX = 0;
              var localMinY = 0;

              count++;

              groups
                .each(moveTowardsCategory(e.alpha))
                .attr('transform', function (d) {
                  var iMinX = d.x - d.radius;
                  var iMinY = d.y - d.radius;
                  var iMaxX = d.x + d.radius;
                  var iMaxY = d.y + d.radius;

                  minx = iMinX < minx ? iMinX : minx;
                  localMinX = iMinX < localMinX ? iMinX : localMinX;

                  miny = iMinY < miny ? iMinY : miny;
                  localMinY = iMinY < localMinY ? iMinY : localMinY;

                  maxx = iMaxX > maxx ? iMaxX : maxx;
                  localMaxX = iMaxX > localMaxX ? iMaxX : localMaxX;

                  maxy = iMaxY > maxy ? iMaxY : maxy;
                  localMaxY = iMaxY > localMaxY ? iMaxY : localMaxY;

                  return 'translate(' + (d.x - minx) + ',' + ((d.y - miny) + 75) + ')';
                });

              if (count % 1 === 0) {
                newHeight = Math.abs(localMaxY - localMinY) + 200;
                newWidth = Math.abs(localMaxX - localMinX) + 100;

                if (g.isSkillDetailView === true) {
                  svg.style('height', h + 'px');
                  svg.style('width', w + 'px');
                } else {
                  if ((newWidth) > w) {
                    svg.style('width', newWidth + 'px');
                  }

                  if ((newHeight) > h) {
                    svg.style('height', newHeight + 'px');
                  }
                }
              }
            });
          force.start();
        }

        // Define move pace towards category
        function moveTowardsCategory(alpha) {
          return function (d) {
            var data = d;
            var target = categoryCenters[data.categoryID];

            data.x = data.x + (target.x - data.x) * (damper + 0.02) * alpha * 1.3;
            data.y = data.y + (target.y - data.y) * (damper + 0.02) * alpha * 1.1;
          };
        }

        // Remove category label
        function hideCategory() {
          svg.selectAll('.category').remove();
        }

        /*
         zoom in/out
         d - the bubble that zoomed
         */
        function zoom(node, tranTime) {
          var j;
          var t;
          var t1;
          var t2;

          if (g.currentView.name === 'Skills') {
            // zoom-out
            if (isCategory === true) {
              if (newHeight > h) {
                svg.style('height', newHeight + 'px');
                setTimeout(function () {
                  container[0].scrollTop = (newHeight - h) / 2;
                }, tranTime / 2);
              }

              if (newWidth > w) {
                svg.style('width', newWidth + 'px');
                setTimeout(function () {
                  container[0].scrollLeft = (newWidth - w) / 2;
                }, tranTime / 2);
              }
            } else {
              setTimeout(function () {
                endall();
              }, tranTime / 2);
            }

            t = d3.selectAll('g#bubble_' + node.id);
            t.transition()
              .duration(tranTime)
              .select('circle')
              .attr('r', function (d) {
                return d.radius;
              })
              .each('end', function () {
                g.isSkillDetailView = false;
                scope.isSkillDetailView = g.isSkillDetailView;
              });

            setTimeout(function () {
              $('.bubble-legend').css('opacity', '1');
            }, tranTime);
          } else {
            // Resize the previous node to the size of the bubble(zoom out previous node)
            if (g.prevSkillNode !== '') {
              t2 = d3.selectAll('g#bubble_' + g.prevSkillNode);
              t2.transition()
                .duration(0)
                .select('circle')
                .attr('r', function (d) {
                  return d.radius;
                })
                .each('end', function () {
                  g.isSkillDetailView = false;
                  scope.isSkillDetailView = g.isSkillDetailView;
                });
            }
            // Zoom-in
            // Append the bubble to the end of svg to make it on the top

            $('#svg_vis').append($('g#bubble_' + node.id));

            $('.bubble-legend').css('opacity', '0');

            g.prevSkillNode = node.id;

            t1 = d3.selectAll('g#bubble_' + node.id);
            j = 0;
            t1.transition()
              .each(function () {
                j++;
              })
              .delay(10)
              .duration(tranTime)
              .select('circle')
              .attr('r', w * 2)
              .each('end', function () {
                if (scope.goToSkillDirectly) {
                  g.isSkillDetailView = true;
                  scope.isSkillDetailView = g.isSkillDetailView;
                }

                j--;
                if (!j) {
                  svg.style('height', h + 'px');
                  svg.style('width', w + 'px');
                  container[0].scrollTop = 0;
                  container[0].scrollLeft = 0;
                }
              });
          }
          return node;
        }

        function findNodeByID(id) {
          // Get node based on the ID, zoom-in that node
          return $.grep(scope.nodes, function (e) {
            return e.id === id;
          })[0];
        }

        function goToBubbleChart(node) {
          // Todo figure out a better way to use node instead of d3 element

          // Show the texts and logos of the bubble chart
          d3.selectAll('text')
            .transition()
            .duration(1200)
            .style('opacity', '1');

          // Zoom out
          zoom(node, 800);

          // Hide the back arrow
          scope.showBackArrow = false;
          scope.goToSkillDirectly = false;

          $('#view_selection').fadeIn();
        }

        function goToSkillDetail(node, tranTime) {
          d3.selectAll('text')
            .transition()
            .duration(tranTime)
            .style('opacity', '0');

          svg.style('opacity', '1');

          scope.zoomedNode = zoom(node, tranTime);
          scope.showBackArrow = true;
          $('#view_selection').fadeOut();

          setTimeout(function () {
            g.isSkillDetailView = true;
            scope.isSkillDetailView = g.isSkillDetailView;
          }, tranTime);
        }

        myMod = {};
        myMod.init = function (_data) {
          renderChart(_data, true);
        };

        myMod.resize = function (_data) {
          renderChart(_data, false);
        };

        myMod.displayAll = displayGroupAll;
        myMod.displayCategory = displayByCategory;
        myMod.toggleView = function (viewType) {
          scope.toggleView = viewType;
          if (viewType === 'category') {
            displayByCategory();
          } else {
            displayGroupAll();
          }
        };
        myMod.toBubbleChart = function (_data) {
          goToBubbleChart(scope.zoomedNode, _data);
        };
        myMod.toSkillDetail = function (id, tranTime) {
          var node = findNodeByID(id);
          var num;

          if (node === undefined) {
            // Find a random project from the projects
            num = Math.floor((Math.random() * (scope.data.items.length - 1) + 1));
            node = findNodeByID(scope.data.items[num]._id);
            // Save the node, if not in bubbleChart
            g.nodesNotInBubbleChart[id] = node;
            goToSkillDetail(node, 1);
          } else {
            goToSkillDetail(node, tranTime);
          }
        };
        return myMod;
      }
    });
  }
}
