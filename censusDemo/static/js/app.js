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
function init(data, active) {

  //alert(active);

  // removedemo
  removeDemo();
  // output read object data to console
  //console.log(data);
  var circles = [];
  data.forEach(function (d) {
    oneCircle = {};
    state = d.abbr;
    if (active[0] == 1)
      x_axis = parseFloat(d.age);
    else if (active[0] == 2)
      x_axis = parseInt(d.income);
    else
      x_axis = parseFloat(d.poverty);

    if (active[1] == 1)
      y_axis = parseFloat(d.smokes);
    else if (active[1] == 2)
      y_axis = parseFloat(d.obesity);
    else
      y_axis = parseFloat(d.healthcare);

    oneCircle = { state, x_axis, y_axis };
    circles.push(oneCircle);
  });
  buildPlot(data, circles, active);
}

function buildPlot(data, circles, active) {

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

  // add x axis titles calling function
  if (active[0] == 0)
    addAxisTitle(data, "In Poverty (%)", "x", 0, 12, "active");
  else
    addAxisTitle(data, "In Poverty (%)", "x", 0, 12, "inactive");

  if (active[0] == 1)
    addAxisTitle(data, "Age (median)", "x", 1, 32, "active");
  else
    addAxisTitle(data, "Age (median)", "x", 1, 32, "inactive");

  if (active[0] == 2)
    addAxisTitle(data, "Household Income (median)", "x", 2, 52, "active");
  else
    addAxisTitle(data, "Household Income (median)", "x", 2, 52, "inactive");

  // add y axis titles calling function
  if (active[1] == 0)
    addAxisTitle(data, "Lacks Healthcare (%)", "y", 0, 8, "active");
  else
    addAxisTitle(data, "Lacks Healthcare (%)", "y", 0, 8, "inactive");

  if (active[1] == 1)
    addAxisTitle(data, "Smokes (%)", "y", 1, 6.7, "active");
  else
    addAxisTitle(data, "Smokes (%)", "y", 1, 6.7, "inactive");

  if (active[1] == 2)
    addAxisTitle(data, "Obese (%)", "y", 2, 5, "active");
  else
    addAxisTitle(data, "Obese (%)", "y", 2, 5, "inactive");

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

// function to overwrite elements and contents on the demographics chart using d3.select
// called from init() function
function removeDemo() {
  d3.select("g").selectAll("text").remove();
  d3.select("g").selectAll("circle").remove();
  d3.select("g").selectAll(".tick").remove();
  d3.select("g").selectAll("g").remove();
}

function addAxisTitle(data, text, axis, axisdata, offset, status) {

  // assign translation text string depending on the axis parameter passed in
  if (axis == "x")
    transText = `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + offset})`;
  else
    transText = `translate(${-chartMargin.left + (offset * offset)}, ${chartHeight / 2 - offset}) rotate(-90)`;

  // add axis titles
  chartGroup.append("text")
    .attr("transform", transText)
    .attr("id", axis+axisdata)
    .classed(status, true)
    .text(text)
    // event listener for onclick event
    .on("click", function () {
      d3.select(this).classed(status, true)
      if (d3.select(this).attr("id").charAt(0) == "x"){
        if (d3.select("#y0").attr("class") == "active")
          init(data, [axisdata, 0])
        if (d3.select("#y1").attr("class") == "active")
          init(data, [axisdata, 1])
        if (d3.select("#y2").attr("class") == "active")
          init(data, [axisdata, 2])
      }
      else {
        if (d3.select("#x0").attr("class") == "active")
          init(data, [0, axisdata])
        if (d3.select("#x1").attr("class") == "active")
          init(data, [1, axisdata])
        if (d3.select("#x2").attr("class") == "active")
          init(data, [2, axisdata])
      }
    })
    // event listener for mouseover
    .on("mouseover", function () {
      d3.select(this).classed(status, true)
    })
    // event listener for mouseout
    .on("mouseout", function () {
      d3.select(this).classed(status, true);
    });
}


// YOUR CODE HERE!
console.log('This is censusDemo d3 js file - Reza Abasaltian');

// Fetch the CSV data and call function init
d3.csv("./data/data.csv").then(data => init(data, [0, 0]));