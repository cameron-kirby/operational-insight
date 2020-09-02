/**
 * Created by Xunrong Li on 5/29/15.
 * Customized Directive: Tree Map <tree-map></tree-map>
 */
ResrcUtilApp.directive('treeMap',
    function (D3Factory, globalState, $window, $cookies, $state, $stateParams, $filter, $rootScope, REST_URL, PROJECT_COLORS, $q, utilities) {
        return {
            restrict: "EA",
            scope: true,
            link: function (scope, element, attrs) {

                scope.$on('reloadTree', function () {
                    customTreeMap.init(globalState.projects);
                });

                D3Factory.d3().then(function (d3) {
                    //detect state change event
                    scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
                        if (toState.name === "home.projects") {
                            globalState.currentView.name = "Projects";
                            /*
                             globalState.isProjectDetailView - main the state whether is project detail or not
                             so that TreeMapController and ProjectDetailController can both access to
                             scope.isProjectDetailView -  control the view (back arrow and detail data)
                             */
                            globalState.isProjectDetailView = false;
                            scope.isProjectDetailView = globalState.isProjectDetailView;
                            if (scope.data) {
                                customTreeMap.toTreeMap(scope.data);
                            }
                        }
                        else if (toState.name === "home.projects.detail") {
                            if (fromState.name === "home.projects") {
                                scope.goToProjectDirectly = true;
                                //zoom from tree map
                                customTreeMap.toProjectDetail(toParams.projectID, 1000);
                            } else {
                                //zoom immediately because it is navigated from other views
                                scope.goToProjectDirectly = true;
                                customTreeMap.toProjectDetail(toParams.projectID, 1);
                            }
                        }
                    });

                    function checkFilterParam() {
                        var filter = '';

                        // if filter is not provided in the url
                        if ($stateParams.filter === undefined) {
                            filter = 'today';
                        }
                        else {
                            filter = $stateParams.filter;
                        }

                        if (($stateParams.filter === undefined) || ($stateParams.manager === undefined)) {
                            $state.go("home.projects", {filter: filter, manager: $cookies.get("myManager")});
                        }
                    }

                    getProjectData();

                    //load tree after MainController loads user data which contains the log in user's reporting manager which is necessary for project, vacation, and skills data
                    scope.$on('initalLoadTree', function () {
                        $state.go("home.projects", {filter: $stateParams.filter, manager: $cookies.get("myManager")});
                    });

                    function getProjectData() {
                        var projFilter = globalState.projectsFilter.value;
                        var manager = utilities.syncManager($stateParams.manager);

                        if (!projFilter) {
                            projFilter = 'today';
                        }

                        checkFilterParam();

                        if (globalState.projectsFilter.value !== undefined && $stateParams.manager !== undefined) {

                            if(!globalState.initialLoadComplete) {
                                globalState.initialLoadComplete = true;
                            }

                            $rootScope.treemapLoading = true;

                            d3.json(REST_URL.hostname + REST_URL.baseUrl + "projects?offset=0&parts=(name,status,totalpeople,totalhours)" +
                                "&sort=UTIL_DESC&treemap=true&range=" + $stateParams.filter + "&manager=" + manager)
                                .header("x-access-token", $cookies.get('myToken'))
                                .get(function (error, data) {

                                    $rootScope.treemapLoading = false;

                                    if (error && error.status == 401) {
                                        $cookies.remove('myToken');
                                        $cookies.remove('myID');
                                        $cookies.remove('myName');
                                        $cookies.remove('myUserRole');
                                        $state.go("login");
                                    }
                                    //reformat data to be hierarchical structure
                                    var formattedData = {
                                        "name": "project",
                                        "children": []
                                    };

                                    globalState.projects = data.items;
                                    formattedData.children = data.items.slice(0, 20);
                                    scope.data = formattedData;
                                    scope.data.children = $filter('filter')(scope.data.children, function (value, index, array) {
                                        return value.total_hours > 0;
                                    });

                                    scope.projects = globalState.projects;

                                    $rootScope.$broadcast('assignProjects');

                                    if(data.items.length > 0) {
                                        customTreeMap.init(scope.data);
                                    }
                                });
                        }
                    }


                    // Browser onresize event - detect more quickly than $watch when resize the browser
                    window.onresize = function () {
                        customTreeMap.resize(scope.data);
                    };

                    // Watch the width of main-content div to see if it changes
                    scope.$watch(function () {
                        return element[0].clientWidth;
                    }, function () {
                        customTreeMap.resize(scope.data);
                        //customTreeMap.resize();
                    });

                    var customTreeMap = (function (d3) {
                        /*
                         the position of the tree map
                         w - width of the map
                         h - height of the map
                         oldW - store the width before changes
                         oldH - store the height before changes
                         cells - a set of cells as boxes
                         nodes - the set to store each skill object
                         */
                        var w,
                            h,
                            oldW,
                            oldH,
                            cells,
                            nodes = [];

                        //select the container for the width of the Tree map
                        var container = $(".map-body");

                        //d3 Tree map layout
                        var treeMap = d3.layout.treemap();

                        //set the svg location and width
                        var svg = d3.select(".map-body").append("svg")
                            .style("width", "100%")
                            .style("height", "100%")
                            .attr("transform", "translate(.5,.5)");

                        /*
                         Render the Tree Map
                         data - project data for boxes
                         initial - initialize (true) the map or resize (false) it
                         */
                        function renderMap(data, initial) {
                            if (!data) {
                                console.log("passing empty data or haven't received data");
                                return;
                            }

                            //setting the position of the tree map
                            w = container.width();
                            h = container.height();

                            //height of panel body based on the height of the header and margin
                            //svg height could not extend automatically, set it to the height of the container
                            //h = $window.innerHeight - 72 - 20 - 60 - 25;
                            svg.style("height", h);
                            $('.project-details').css('height', h);

                            //setting the height of project details div to be the same as the container
                            var containerHeight = $('.map-body svg').height();
                            $('project-details').outerHeight(containerHeight);

                            //set Tree Map based on total-hours
                            treeMap.round(false)
                                .size([w, h])
                                .sticky(true)
                                .value(function (d) {
                                    return d.total_hours;
                                });

                            //map the project with color set
                            fillColor = d3.scale.ordinal()
                                .domain(data)
                                .range(PROJECT_COLORS);

                            if (initial) {
                                //initialize the map
                                start(data);
                            }
                            else {
                                /*
                                 two situations for resizing:
                                 1. already zoom-in to detail page, just call zoom function to resize it without transition animation
                                 2. before zoom-in, just set own resize scale
                                 */
                                if (globalState.isProjectDetailView) {
                                    var node = findNodeByID($stateParams.projectID);
                                    if (scope.goToProjectDirectly) {
                                        if (node === undefined) { // save the node, if it is not treemap
                                            if (globalState.nodesNotInTreeMap[$stateParams.projectID] === undefined) {
                                                //find a random project from the projects
                                                var num = Math.floor((Math.random() * (scope.data.children.length - 1) + 1));
                                                node = findNodeByID(scope.data.children[num].proj_id);
                                                globalState.nodesNotInTreeMap[$stateParams.projectID] = node;
                                            }
                                            else {
                                                node = globalState.nodesNotInTreeMap[$stateParams.projectID];
                                            }
                                        }
                                        console.log("here if");
                                    }
                                    else {
                                        console.log("here else");
                                        node = scope.zoomedNode;
                                    }
                                    zoom(node, 1);
                                }
                                else {
                                    resizeMap();
                                }
                            }
                        }

                        /*
                         add the group element includes logo, name, people, hours of project
                         */
                        function displayProjectInfo() {

                            //remove the existing project info
                            svg.selectAll(".group.text_wrapper").remove();

                            var groups = svg.selectAll(".cell")
                                .append("g")
                                .attr("class", "group text_wrapper");

                            svg.selectAll(".cell").append("svg:title")
                                .text(function (d) {
                                  return d.people_count + " employees contribute(s) " + d.total_hours + " hours on " + d.name;
                                });

                            //project name
                            groups.append("text")
                                .attr('class', 'proj_name')
                                .attr("x", "10")
                                .attr("y", "25")
                                .attr("font-size", "0.85rem")
                                .attr("fill", "white")
                                .attr("text-anchor", "start")
                                .text(function (d) {
                                    //check if it is the root node
                                    return d.children ? null : d.name;
                                })
                                .text(function (d) {
                                    var id = d.proj_id;
                                    var rect = svg.select("#cell_" + id + " rect");
                                    var dwidth = rect[0][0].getBoundingClientRect().width;
                                    if (this.getBBox().width > dwidth - 15) {
                                        var bwidth = this.getBBox().width;
                                        var percent = (((bwidth - dwidth) / dwidth) * 100) + 12;
                                        if (d.children) {
                                            return null;
                                        }
                                        else {
                                            var dname = d.name;
                                            var length = dname.length;
                                            length = length * ((100 - percent) / 100);
                                            if (length < 0) {
                                                length = 3;
                                            }
                                            return dname.slice(0, length - 1).concat("...");
                                        }
                                    }
                                    return d.children ? null : d.name;
                                });


                            // icon of people
                            groups.append("text")
                                .attr("font-family", "Ionicons")
                                .attr("font-size", "0.7rem")
                                .attr("text-anchor", "start")
                                .attr("x", "10")
                                .attr("y", "55")
                                .attr("fill", "white")
                                .text(function (d) {
                                    return d.children ? null : '\uf3a0';
                                });  //using unicode to display icon on svg text element

                            //number of people
                            groups.append("text")
                                .attr("font-size", "0.7rem")
                                .attr("text-anchor", "start")
                                .attr("x", "28")
                                .attr("y", "55")
                                .attr("fill", "white")
                                .text(function (d) {
                                    return d.children ? null : d.people_count;
                                });

                            //icon of hours
                            groups.append("text")
                                .attr("font-family", "Ionicons")
                                .attr("font-size", "0.7rem")
                                .attr("text-anchor", "start")
                                .attr("x", "50")
                                .attr("y", "55")
                                .attr("fill", "white")
                                .text(function (d) {
                                    //return d.children ? null : '\uf3b3';
                                    var id = d.proj_id;
                                    var rect = svg.select("#cell_" + id + " rect");
                                    var dwidth = rect[0][0].getBoundingClientRect().width;

                                    if (dwidth <= 110) {
                                        return null;
                                    } else {
                                        return d.children ? null : '\uf3b3';
                                    }

                                });

                            //total hours
                            groups.append("text")
                                .attr("font-size", "0.7rem")
                                .attr("text-anchor", "start")
                                .attr("x", "68")
                                .attr("y", "55")
                                .attr("id", "total_hours")
                                .attr("fill", "white")
                                .text(function (d) {

                                    var id = d.proj_id;
                                    var rect = svg.select("#cell_" + id + " rect");
                                    var dwidth = rect[0][0].getBoundingClientRect().width;

                                    if (dwidth < 130 && dwidth > 110) {
                                        return d.children ? null : d.total_hours;
                                    } else if (dwidth <= 110) {
                                        return null;
                                    } else {
                                        return d.children ? null : d.total_hours + " hrs";
                                    }
                                });
                        }

                        function goToTreeMap(node, root) {
                            //show the texts and logos of the tree map
                            d3.selectAll("g.group")
                                .transition()
                                .duration(1000)
                                .style("opacity", "1");

                            //zoom out
                            zoom(root, 750);

                            //hide the back arrow
                            scope.showBackArrow = false;
                            scope.goToProjectDirectly = false;
                        }

                        function goToProjectDetail(node, tranTime) {

                            //hide the tree map info for this box
                            d3.selectAll('g.group')
                                .transition()
                                .duration(tranTime)
                                .style("opacity", "0");

                            //set shorter transition time for click and zoom in
                            if (tranTime > 1) {
                                tranTime -= 250;
                            }
                            //zoom in to specific node
                            scope.zoomedNode = zoom(node, tranTime);
                            scope.showBackArrow = true;
                        }

                        function findNodeByID(id) {
                            //get node based on the ID, zoom-in that node
                            return $.grep(nodes, function (e) {
                                return e.proj_id == id;
                            })[0];
                        }

                        /*
                         initialize the Tree map
                         data - project data
                         */
                        function start(data) {
                            //set the zoomed node to be null
                            scope.zoomedNode = null;

                            // remove all previous items before render
                            svg.selectAll("*").remove();

                            // an array to store the data of Tree Map to populate the set of cells
                            nodes = treeMap.nodes(data);

                            //create a set of cells as boxes
                            cells = svg.selectAll(".cell")
                                .data(nodes)
                                .enter()
                                .append("g")
                                .attr("class", "cell")
                                .attr("id", function (d) {
                                    return "cell_" + d.proj_id;
                                })
                                .attr("transform", function (d) {
                                    /*
                                     x,y represent the start point of the rectangular,
                                     x means the top left corner, dx means width of the rectangular, y means
                                     */
                                    return "translate(" + d.x + "," + d.y + ")";
                                })
                                .on("click", function (d) {
                                    if (!scope.isProjectDetailView && !scope.goToProjectDirectly) {
                                        scope.zoomedNode = d;

                                        //debugger;
                                        $state.go('home.projects.detail', {projectID: d.proj_id, filter: globalState.projectsFilter.value, manager: $cookies.get("myManager")});
                                    }
                                });


                            var fillColor = setColorMapping(data.children);

                            //add the rect element to g and populate them with colors
                            cells.append("rect")
                                .attr("class", "cell_rect")
                                .attr("width", function (d) {
                                    return d.dx;
                                })
                                .attr("height", function (d) {
                                    return d.dy;
                                })
                                .style("fill", function (d, i) {

                                    var id = d.proj_id;
                                    if (!globalState.projectColorMapping[id]) {
                                        globalState.projectColorMapping[id] = fillColor(id);
                                    }

                                    return globalState.projectColorMapping[id];

                                })
                                .attr("stroke", "white")
                                .attr("stroke-width", 1);

                            //display project overview information (name, number of people, number of hours)
                            displayProjectInfo(cells);

                            // store the width and height for resize in the future
                            oldW = w;
                            oldH = h;
                            if($stateParams.projectID!==undefined){
                                scope.goToProjectDirectly=true;
                            }
                            //if go to the project detail directly
                            if (scope.goToProjectDirectly) {
                                var node = findNodeByID($stateParams.projectID);
                                if (node === undefined) {
                                    //find a random project from the projects
                                    var num = Math.floor((Math.random() * (scope.data.children.length - 1) + 1));
                                    node = findNodeByID(scope.data.children[num].proj_id);
                                    globalState.nodesNotInTreeMap[$stateParams.projectID] = node;
                                }
                                goToProjectDetail(node, 1);
                            }
                        }

                        /*
                         create new scale based on previous and current width/height
                         */
                        function resizeMap() {
                            if (!oldW || !oldH) {
                                console.log("forget to initialize before resizing");
                                return;
                            }

                            var newX = d3.scale.linear()
                                .domain([0, oldW])
                                .range([0, w]);
                            var newY = d3.scale.linear()
                                .domain([0, oldH])
                                .range([0, h]);

                            cells.transition()
                                .duration(1)
                                .attr("transform", function (d) {
                                    return "translate(" + newX(d.x) + "," + newY(d.y) + ")";
                                });

                            cells.select("rect")
                                .attr("width", function (d) {
                                    return newX(d.dx);
                                })
                                .attr("height", function (d) {
                                    return newY(d.dy);
                                });

                            displayProjectInfo();
                        }

                        function setColorMapping(projectList) {
                            var projects = [];

                            if(projects.length > 0) {
                                projectList.forEach(function (elem, index, array) {
                                    projects.push(elem.proj_id);
                                });
                            }
                            else {
                                console.log("Projects are empty");
                            }

                            var colorSet = [];
                            for (var c = 0; c < PROJECT_COLORS.length; c++) {
                                colorSet.push(PROJECT_COLORS[c]);
                            }
                            // projects are more than the colors, add colors to the colorSet from PROJECT_COLORS
                            //if (projects.length > colorSet.length) {
                            //    var l = 0;
                            //    // since we have only 13 colors, start the index from 13 and end the index at 19, since we show only 20 projects
                            //    for (var m = 13; m < 20; m++) {
                            //        colorSet.push(PROJECT_COLORS[l]);
                            //        l++;
                            //    }
                            //}

                            if (Object.keys(globalState.projectColorMapping).length > 0) {
                                for (var key in globalState.projectColorMapping) {
                                    var index = projects.indexOf(key);
                                    if (index !== -1) {
                                        projects.splice(index, 1);
                                        var colorIndex = colorSet.indexOf(globalState.projectColorMapping[key]);
                                        colorSet.splice(colorIndex, 1);
                                    }
                                }
                                // if project number > color number, allow duplicated colors
                                if (colorSet.length === 0) {
                                    for (var k = 0; k < PROJECT_COLORS.length; k++) {
                                        colorSet.push(PROJECT_COLORS[k]);
                                    }
                                }
                            }
                            //map the projects with color sets
                            var fillColor = d3.scale.ordinal()
                                .domain(projects)
                                .range(colorSet);

                            return fillColor;
                        }

                        /*
                         d - the zoomed-in node
                         tranTime - set zoom transition time of animation
                         */
                        function zoom(d, tranTime) {
                            /*
                             d - the node that you click/zoom in
                             d.x, d.y - the node position (the transform attribute of g element = translate (d.x, d.y))
                             d.dx, d.dy - the width and height of the child rect element of g
                             */

                            // kx, ky - the zoom-in factor
                            var kx = w / d.dx, ky = h / d.dy;

                            //set x and y scale for mapping input and output size
                            var x = d3.scale.linear().domain([d.x, d.x + d.dx]).range([0, w]);
                            var y = d3.scale.linear().domain([d.y, d.y + d.dy]).range([0, h]);

                            var t = svg.selectAll("g.cell")
                                .transition()
                                .duration(tranTime)
                                .attr("transform", function (d) {
                                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                                })
                                .each('end', function () {
                                    if (scope.goToProjectDirectly) {
                                        globalState.isProjectDetailView = true;
                                        scope.isProjectDetailView = globalState.isProjectDetailView;
                                    }
                                });

                            t.select("rect")
                                .attr("width", function (d) {
                                    return kx * d.dx - 1;
                                })
                                .attr("height", function (d) {
                                    return ky * d.dy - 1;
                                });
                            return d;
                        }

                        var myMod = {};
                        myMod.init = function (_data) {
                            renderMap(_data, true);
                        };

                        myMod.resize = function (_data) {
                            renderMap(_data, false);
                        };

                        myMod.toTreeMap = function (_data) {
                            goToTreeMap(scope.zoomedNode, _data);
                        };

                        myMod.toProjectDetail = function (id, tranTime) {
                            var node = findNodeByID(id);
                            if (node === undefined) {
                                //find a random project from the projects
                                var num = Math.floor((Math.random() * (scope.data.children.length - 1) + 1));
                                node = findNodeByID(scope.data.children[num].proj_id);
                                //save the node, if not in treemap
                                globalState.nodesNotInTreeMap[id] = node;
                                goToProjectDetail(node, 1);
                            }
                            else {
                                goToProjectDetail(node, tranTime);
                            }
                        };
                        return myMod;
                    })(d3);
                });

            }
        };
    });
