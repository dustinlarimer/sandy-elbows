var user_data = {
	nodes: [],
	links: []
};

/*
	default_canvas_settings = {};
	default_object_library  = {};
	user_composition_data   = {};
	user_canvas_settings    = {};
	user_theme_settings     = {};
	var stage = {
		fill   : d3.scale.category20(),
		height : 600,
		width  : 1118
	}
*/

var stage_width  = 1118,
    stage_height = 600,
    stage_fill   = '#fff';

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

var outer = d3.select("#stage")
	.append("svg:svg")
    .attr("width", stage_width)
    .attr("height", stage_height)
		.attr("pointer-events", "all");

var vis = outer
  .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
  .append('svg:g')
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);

vis.append("svg:rect")
		.attr("fill", stage_fill)
    .attr("height", stage_height)
		.attr("width", stage_width);

var force = d3.layout.force()
	.charge(0)
	.gravity(0)
	.nodes(user_data.nodes)
	.links(user_data.links)
	.size([stage_width, stage_height])
	.start();

var nodes = force.nodes(),
    //links = force.links(),
    node  = vis.selectAll(".node");
    //link  = vis.selectAll(".link");

d3.select(window).on("keydown", keydown);

var node_drag = d3.behavior.drag()
	.on("dragstart", dragstart)
	.on("drag", dragmove)
	.on("dragend", dragend);

function dragstart(d, i) {
	force.stop();
}

function dragmove(d, i) {
	d.px += d3.event.dx;
	d.py += d3.event.dy;
	d.x  += d3.event.dx;
	d.y  += d3.event.dy;
	force.tick();
}

function dragend(d, i) {
	d.fixed = true;
	force.tick();
	force.resume();
}

function mousedown() {
	if (!mousedown_node) { // && !mousedown_link
    // allow panning if nothing is selected
		vis.call(d3.behavior.zoom().on("zoom", rescale));
    return;
  }
}
function mousemove() {
  if (!mousedown_node) return;
}
function mouseup() {
  if (!mousedown_node && !mouseup_node) {
   	var spot = d3.mouse(this),
 		node = {
				x : spot[0], 
				y : spot[1], 
				px: spot[0],
				py: spot[1]+1,
				r : 45,
				f : '#E5E5E5',
				s : '#FFFFFF',
				sw: 3
			};
		user_data.nodes.push(node);
		draw();
  }
  // clear mouse event vars
  resetMouseVars();
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node   = null;
  mousedown_link = null;
}

function rescale() {
  trans = d3.event.translate;
  scale = d3.event.scale;
  vis.attr("transform", "translate(" + trans + ")" + " scale(" + scale + ")");
}

function keydown() {
	console.log('Key#: ' + d3.event.keyCode);
	if (!selected_node) return;
	switch (d3.event.keyCode) {
    case 8: 		// backspace
    case 46: { 	// delete
			console.log(nodes);
      if (selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
      }
      selected_node = null;
      draw();
      break;
    }
  }
}


force.on("tick", function() {
	stage_height = $('#stage').height();
	stage_width = $('#stage').width();
	$("#stage svg")
		.attr('height', stage_height)
		.attr('width', stage_width);
	force.size([stage_width, stage_height]);
	
  vis.selectAll("circle")
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
});

function draw() {
	node = node.data(nodes);
	node.enter().append('svg:circle')
			.attr("class", "node")
	    .attr("cx", function(d) { return d.x; })
	    .attr("cy", function(d) { return d.y; })
	    .attr("r", function(d) { return d.r; })
			.attr("fill", function(d) { return d.f; })
			.attr("stroke", function(d) { return d.s; })
			.attr("stroke-width", function(d) { return d.sw; })
			.call(node_drag)
	   	.transition()
	     	.ease(Math.sqrt)
	node
			/*
			.on("click", function(d){
				selected_node = d;
				draw();
			})
			.on("drag", function(d,i) {
				d.x += d3.event.dx;
				d.y += d3.event.dy;
				d3.select(this)
					//.attr('cx', function(d){ return d.x; })
					//.attr('cy', function(d){ return d.y; });
			})*/
			.on("mousedown", function(d) { 
				vis.call(d3.behavior.zoom().on("zoom", null));
				mousedown_node = d;
				if (mousedown_node == selected_node) {
					selected_node = null;
				} else {
					selected_node = mousedown_node;
				}
				draw();
			})
			.on("mouseup", function(d) { 
				if (mousedown_node) {
					mouseup_node = d; 
					if (mouseup_node == mousedown_node) { 
						selected_node = mousedown_node;
						//draw();
						/*resetMouseVars(); return;*/
					}
					vis.call(d3.behavior.zoom().on("zoom", rescale));
					draw();
				} 
      })
			.classed("node_selected", function(d) { return d === selected_node; })
			.exit()
			.transition()
    	.attr("r", 0)
    	.remove();
	
	if (d3.event) {
    d3.event.preventDefault();
  }
	
 	force.start();
}
draw();


$(function(){
	/*
	function adjust(){
		setTimeout(function() {
			var stage_height = $('#stage').height();
			var stage_width = $('#stage').width();
			$("#stage svg")
				.attr('height', stage_height)
				.attr('width', stage_width);
			force
				.size([stage_width, stage_height])
				.start();
		}, 250);
	}
	adjust();
	$(window).resize(function() { adjust() });*/
});