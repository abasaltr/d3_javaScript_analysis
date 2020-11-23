// Define SVG area dimensions
var svgWidth = 675;
var svgHeight = 475;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 100,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter").append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// intialize function to read from data.csv within D3 .then statement
// call the functions to create visualizations 
function init(data) {
  // output read object data to console
  console.log(data);
  var circles = [];
  data.forEach(function (d) {
    oneCircle = {};
    state = d.abbr;
    x_axis = parseFloat(d.poverty);
    y_axis = parseFloat(d.healthcare);
    oneCircle = { state, x_axis, y_axis };
    circles.push(oneCircle);
  });
  buildPlot(circles);
}

function buildPlot(circles) {

  //console.log(circles);

  //console.log("x:", d3.extent(circles, d => d.x_axis));
  //console.log([d3.min(circles, d => d.x_axis)-1, d3.max(circles, d => d.x_axis)+1])
  //console.log("y:", d3.extent(circles, d => d.y_axis));
  //console.log([d3.min(circles, d => d.y_axis)-1, d3.max(circles, d => d.y_axis)+1]);

  // scale y to chart height
  var yScale = d3.scaleLinear()
    .domain([d3.min(circles, d => d.y_axis) - 1, d3.max(circles, d => d.y_axis) + 1])
    .range([chartHeight, 0]);

  // scale x to chart width
  var xScale = d3.scaleLinear()
    .domain([d3.min(circles, d => d.x_axis) - 1, d3.max(circles, d => d.x_axis) + 1])
    .range([0, chartWidth]);

  // create axes
  var yAxis = d3.axisLeft(yScale);
  var xAxis = d3.axisBottom(xScale).ticks(7);

  // set x to the bottom of the chart
  chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`).call(xAxis);

  // set y to the y axis
  // This syntax allows us to call the axis function
  // and pass in the selector without breaking the chaining
  chartGroup.append("g").call(yAxis);

  // add x axis title
  chartGroup.append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + 16})`)
    .classed("aText", true)
    .text("In Poverty (%)");

  // add y axis title
  chartGroup.append("text")
    .attr("transform", `translate(${-chartMargin.left + 62}, ${chartHeight / 2 -8}) rotate(-90)`)
    .classed("aText", true)
    .text("Lacks Healthcare (%)");

  // add circle data elements
  chartGroup.selectAll("svg")
    .data(circles)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xScale(d.x_axis))
    .attr("cy", d => yScale(d.y_axis))
    .attr("r", 9);

  // add state abbreviations inside circle data elements
  chartGroup.selectAll("svg")
    .data(circles)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("dx", d => xScale(d.x_axis))
    .attr("dy", d => yScale(d.y_axis) + 3)
    .attr("font-size", 8)
    .text(d => d.state)

}


// YOUR CODE HERE!
console.log('This is censusDemo d3 js file - Reza Abasaltian');

// Fetch the CSV data and call function init
d3.csv("./data/data.csv").then(data => init(data));