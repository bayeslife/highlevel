'use strict';

angular.module('highlevelApp')
  .factory('D3Editor', function D3Editor($rootScope) {

    var width  = 800;
    var height = 400;
    var absUrl;  
    var svg;
    var path,circle;
    var colors;
    //var nodes,links;
    var bayesnetwork;
    var force;
    var selected_node,selected_link = null;
    var mousedown_node,mousedown_link,mouseup_node;
    var $scope;
    var drag_line;
    var attr;

    // Public API here
    return {

     //  layout: function(){
     //    layoutNow();
     //  },

     //  layoutStop: function(){
     //    layoutStop();
     //  },

     // layoutStart: function(){
     //    layoutStart();
     //  },



      refresh: function(){
        restart();
      },

     render: function(absoluteUrl,bayesmodel,scope) {
        $scope = scope;
        absUrl = absoluteUrl;
        bayesnetwork = bayesmodel;

      
          colors = d3.scale.category10();
          
          svg = d3.select('#editor');
          // init D3 force layout
          force = d3.layout.force()
          .nodes(bayesnetwork.getNodes())
          .links(bayesnetwork.getLinks())
          .size([width, height])          
          .linkStrength(0.5)
          .charge(-200)                
          .on('tick', tick);

          force.linkDistance(linkDistance);

          force.gravity(0.1);

          var drag = force.drag().on("dragstart", dragstart);

        
          // line displayed when dragging new nodes
          drag_line = svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');

          // handles to link and node element groups
          path = svg.append('svg:g').selectAll('path'),
              circle = svg.append('svg:g').selectAll('g');

          // mouse event vars

          // app starts here
          svg.on('mousedown', mousedown)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);

          d3.select(window)
              .on('keydown', keydown)
              .on('keyup', keyup);
              restart();                   
    },
  };

      // update force layout (called automatically each iteration)
      function tick(e) { 

        var k = 6 * e.alpha;
          bayesnetwork.getNodes().forEach(function(o, i) {

            if(o.type=='outcome'){
              o.y += k;
            }
            else if(o.type=='capabilities'){
              o.y += 0.5+k;
            }
            else if(o.type=='choice'){
              o.y += -0.5*k;
            } 
            else if(o.type=='category'){
              o.y += -k;
            } 
        });       

        // draw directed edges with proper padding from node centers
        path.attr('d', function(d) {
          var deltaX = d.target.x - d.source.x,
              deltaY = d.target.y - d.source.y,
              dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
              normX = deltaX / dist,
              normY = deltaY / dist,
              sourcePadding = d.left ? 34 : 24,
              targetPadding = d.right ? 34 : 24,
              sourceX = d.source.x + (sourcePadding * normX),
              sourceY = d.source.y + (sourcePadding * normY),
              targetX = d.target.x - (targetPadding * normX),
              targetY = d.target.y - (targetPadding * normY);        
          return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
        $scope.$apply();
      }


      function node_radius(node){ 
        return node.probability>=0 && node.probability<=1 ? 10+node.probability*10 : 20;
       }

      function linkDistance(link,index){
        return 100 + $scope.getCorrelation(link,index)*-40;
      }

      // function gravity(){
      //   //return 0.1;
      //   if(node.type=='category'){
      //     return 0.1;
      //   }else if(node.type=='outcome'){
      //     return 0.2;        
      //   }
      //   return 0.1;
      // }

      function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
      }

      
      // update graph (called when needed)
      function restart() {
        // path (link) group
        path = path.data(bayesnetwork.getLinks());

        // update existing links
        path.classed('selected', function(d) { return d === selected_link; })
          .style('marker-start', function(d) { return d.left ? 'url('+absUrl+'#start-arrow)' : ''; })    
          .style('marker-end', function(d) { return d.right ? 'url('+absUrl+'#end-arrow)' : ''; });
          

        // add new links
        path.enter().append('svg:path')
          .attr('class', 'link')
          .classed('selected', function(d) { return d === selected_link; })    
          .style('marker-start', function(d) { return d.left ? 'url('+absUrl+'#start-arrow)' : ''; })    
          .style('marker-end', function(d) { return d.right ? 'url('+absUrl+'#end-arrow)' : ''; })
          .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;

            // select links
            mousedown_link = d;
            if(mousedown_link === selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;
            restart();
          });

        // remove old links
        path.exit().remove();


        // circle (node) group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        circle = circle.data(bayesnetwork.getNodes(), function(d) { return d._id; });

        // update existing nodes (reflexive & selected visual states)
        circle.selectAll('circle')
          .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.color)).brighter().toString() : colors(d.color); })
          .attr('r',node_radius)
          .classed('reflexive', function(d) { return d.reflexive; });


        circle.selectAll('text').text(function(d) { return d.name; });

        // add new nodes
        var g = circle.enter().append('svg:g');

        g.append('svg:circle')
          .attr('class', 'node')          
          .attr('r',node_radius)
          .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.color)).brighter().toString() : colors(d.color); })
          .style('stroke', function(d) { return d3.rgb(colors(d.color)).darker().toString(); })
          .classed('reflexive', function(d) { return d.reflexive; })
          .on('mouseover', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // enlarge target node
            d3.select(this).attr('transform', 'scale(1.1)');
          })
          .on('mouseout', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            d3.select(this).attr('transform', '');
          })
          .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;

            // select node
            mousedown_node = d;
            if(mousedown_node === selected_node) {
              $scope.deselectNode(selected_node);
              selected_node = null;
            } else {
              selected_node = mousedown_node;
              $scope.selectNode(selected_node);              
            }
            selected_link = null;

            // reposition drag line
            drag_line
              .style('marker-end', 'url(#markerCircle)')        
              .classed('hidden', false)
              .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

            restart();
          })
          .on('mouseup', function(d) {
            if(!mousedown_node) return;

            // needed by FF
            drag_line
              .classed('hidden', true)
              .style('marker-end', '');

            // check for drag-to-self
            mouseup_node = d;
            if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

            // unenlarge target node
            d3.select(this).attr('transform', '');

            // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            // if(mousedown_node._id < mouseup_node._id) {
            //   source = mousedown_node;
            //   target = mouseup_node;
            //   direction = 'right';
            // } else {
            //   source = mouseup_node;
            //   target = mousedown_node;
            //   direction = 'left';
            // }

            source = mousedown_node;
            target = mouseup_node;
            direction = 'right';

            var link;
            link = bayesnetwork.getLinks().filter(function(l) {
              return (l.source === source && l.target === target);
            })[0];

            if(link) {
              link[direction] = true;
            } else {
              $scope.addLink(source,target,function(l){
                if(l!=null){
                    l[direction] = true;
                    //bayesnetwork.getLinks().push(l);
                    restart();
                  }  
              });
              //link = {source: source, target: target, left: false, right: false};              
            }

            // select new link
            selected_link = link;
            selected_node = null;
            restart();
          });

        // show node IDs
        g.append('svg:text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'id')
            .attr('contentEditable', true)
            .on('keyup', function(d) { 
              d.text = d3.select(this).text(); 
            })
            .text(function(d) { return d.name; });

        // remove old nodes
        circle.exit().remove();

        // set the graph in motion
        force.start();

        //layoutNow();
      }

      // function layoutNow() {
      //   //force.drag();
      //   // force.start();        
      //   // for (var i = 0; i < 100; i++){
      //   //   force.tick();
      //   // } 
      //   // force.stop();          
      //   // //$scope.$apply();
      // }

      // function layoutStop() {        
      //   force.stop();
      // }


      // function layoutStart() {        
      //   force.start();
      // }

      function mousedown() {
        // prevent I-bar on drag
        //d3.event.preventDefault();
        
        // because :active only works in WebKit?
        svg.classed('active', true);

        if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

        // insert new node at point
        var point = d3.mouse(this);
        
        $scope.addNode(function(node){
          //node = {_id: ++lastNodeId, name: 'new', color: 4, reflexive: false};
          node.x = point[0];
          node.y = point[1];          
          restart();  
        })        
      }

      function mousemove() {
        if(!mousedown_node) return;

        // update drag line
        drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

        restart();
      }

      function mouseup() {
        if(mousedown_node) {
          // hide drag line
          drag_line
            .classed('hidden', true)
            .style('marker-end', '');
        }

        // because :active only works in WebKit?
        svg.classed('active', false);

        // clear mouse event vars
        resetMouseVars();
      }

      function spliceLinksForNode(node) {
        var links = bayesnetwork.getLinks();
        var toSplice = links.filter(function(l) {
          return (l.source === node || l.target === node);
        });
        toSplice.map(function(l) {

          links.splice(links.indexOf(l), 1);
        });
      }

      // only respond once per keydown
      var lastKeyDown = -1;

      function keydown() {
        //d3.event.preventDefault();
        var links = bayesnetwork.getLinks();

        if(lastKeyDown !== -1) return;
        lastKeyDown = d3.event.keyCode;

        // ctrl
        if(d3.event.keyCode === 17) {
          circle.call(force.drag);
          svg.classed('ctrl', true);
        }

        //console.log(d3.event.shiftKey);
        //console.log(d3.event.keyCode);
        //console.log(d3.event.ctrlKey);
        {
          switch(d3.event.keyCode) {            
            case 46: // ctl-delete              
              if(d3.event.ctrlKey){
                  if(selected_node) {
                    var nodes = bayesnetwork.getNodes();
                    nodes.splice(nodes.indexOf(selected_node), 1);
                    spliceLinksForNode(selected_node);
                    $scope.delNode(selected_node);
                  } else if(selected_link) {
                    links.splice(links.indexOf(selected_link), 1);
                    $scope.delLink(selected_link);
                  }
                  selected_link = null;
                  selected_node = null;
                  restart();
                }                
            break;
           
            case 66: // B
              if(selected_link) {
                // set link direction to both left and right
                selected_link.left = true;
                selected_link.right = true;
              }
              restart();
              break;
            case 76: // L
              if(selected_link) {
                // set link direction to left only
                selected_link.left = true;
                selected_link.right = false;
              }
              restart();
              break;
            case 82: // R
              if(selected_node) {
                // toggle node reflexivity
                selected_node.reflexive = !selected_node.reflexive;
              } else if(selected_link) {
                // set link direction to right only
                selected_link.left = false;
                selected_link.right = true;
              }
              restart();
              break;
            case 190: // >
              if(selected_link) {                                
                $scope.increaseCorrelation(selected_link);
                restart();
              }              
              break;
            case 188: // <
              if(selected_link) {
                $scope.decreaseCorrelation(selected_link);                                
                restart();
              }              
              break;
            }
        }
      }

      function keyup() {
        lastKeyDown = -1;

        // ctrl
        if(d3.event.keyCode === 17) {
          circle
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
          svg.classed('ctrl', false);
        }
      }

      function dragstart(d) {
         d3.select(this).classed("fixed", d.fixed = true);
      }

});
