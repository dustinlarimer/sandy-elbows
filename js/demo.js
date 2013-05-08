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

var stage_width  = 900,
    stage_height = 600,
    stage_fill   = '#fff';

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
		keydown_code = null;

var outer = d3.select("#stage")
	.append("svg:svg")
    .attr("width", stage_width)
    .attr("height", stage_height)
		.attr("pointer-events", "all");

var vis = outer
  .append('svg:g')
    //.call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
  .append('svg:g')
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);

vis.append("svg:rect")
		.attr("fill", stage_fill)
    .attr("height", stage_height)
		.attr("width", stage_width)
		.attr('x', 10)
		.attr('y', 50);

var force = d3.layout.force()
	.charge(0) // -10
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
	if (mousedown_node) mousedown_node = null;
}

function dragmove(d, i) {
	d.px += d3.event.dx;
	d.py += d3.event.dy;
	d.x  += d3.event.dx;
	d.y  += d3.event.dy;
	force.tick();
}

function dragend(d, i) {
	//d.fixed = true;
	force.tick();
	force.resume();
}

function mousedown() {
	if (!mousedown_node) { // && !mousedown_link
		selected_node = null;
		//vis.call(d3.behavior.zoom().on("zoom", rescale));
		draw();
    return;
  }
}
function mousemove() {
  // if (!mousedown_node) return;
}
function mouseup() {
  if (!mouseup_node) {
   	var spot = d3.mouse(this),
 		node = {
				x : spot[0], 
				y : spot[1], 
				px: spot[0],
				py: spot[1]+1,
				r : 45,
				f : '#FBFBFB',
				s : '#E5E5E5',
				sw: 3
			};
		user_data.nodes.push(node);
		draw();
  }
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
	//keydown_code = d3.event.keyCode;
	switch(d3.event.keyCode) {
		case 8:
		case 46: {
			if (selected_node) nodes.splice(nodes.indexOf(selected_node), 1);
			selected_node = null;
      draw();
      break;
		}
	}
}

force.on("tick", function() {	
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
			.on("mousedown", function(d) { 
				vis.call(d3.behavior.zoom().on("zoom", null));
				mousedown_node = d;
				draw();
			})
			.on("mouseup", function(d) { 
				if (mousedown_node) {
					mouseup_node = d; 
					if (mouseup_node == mousedown_node) { 
						selected_node = mousedown_node;
					}
					//vis.call(d3.behavior.zoom().on("zoom", rescale));
					draw();
				} 
      })
			.classed("node_selected", function(d) { return d === selected_node; })
			.exit()
			.transition()
			.attr("stroke", "")
    	.attr("r", 0)
    	.remove();
	
	if (d3.event) {
    d3.event.preventDefault();
  }
	
 	force.start();
}
draw();


$(function(){
	function adjust(){
		setTimeout(function() {
			var stage_height = $('#stage').height();
			var stage_width = $('#stage').width();
			$("#stage svg")
				.attr('height', stage_height)
				.attr('width', stage_width);
			$("#stage svg rect")
				.attr('height', stage_height-60)
				.attr('width', stage_width-20)
			force
				.size([stage_width, stage_height])
				.start();
		}, 250);
	}
	adjust();
	$(window).resize(function() { adjust() });
});