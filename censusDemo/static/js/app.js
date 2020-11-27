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
// call the function removeDemo() to replace current chart and content on html used for different content selection
// call the function buildPlot() to create visualizations
// call the function addSummary() to add a description summary report below the chart
// passing in parameters are the data read and the active array list used for the chart content, examples below:
// [0,0] refers to poverty vs. lacks healthcare, 
// [1,0] age vs. lacks healthcare,
// [1,1] age vs. smokes
// called at application startup within D3 .then statemet and also from addAxisTitle() function
function init(data, active) {

  // call function to refresh html page
  removeDemo();
  // output read object data to console
  //console.log(data);
  var circles = [];
  // loop through each record of the data element to create a circles array containing contents for the chart to display
  // the contents depend on the condition of the active array list and 
  // the values will be formatted and assigned to an x and y axis variables
  data.forEach(function (d) {
    oneCircle = {};
    state = d.abbr;
    stateFull = d.state;
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
    // assign a single circle list containing contents of the state, and its axis variables defined above
    oneCircle = { stateFull, state, x_axis, y_axis };
    // append the circle to the full circles array set
    circles.push(oneCircle);
  });
  // call function to create the visualization passing in the dataset, circles array, and the active array
  buildPlot(data, circles, active);
  // call function to add a description summary report below the chart passing in the active array
  addSummary(active);
} //end init()

// function to create the visualization on the html by appending to the chartGroup defined above
// defines the scales, axis titles, tooltip used for each marker, circles marker and the state abbreviations within it
// call the function addAxisTitle() to overwrite current axis titles, values and 
// to change active array depending on user selection, and then re-passing it back as a parameter to the init() function
// called from init() function
// parameters passed in are the data set, circles array, and the active array list
function buildPlot(data, circles, active) {

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

  // set y to the y axis that allows us to call the axis function
  // and pass in the selector without breaking the chaining
  chartGroup.append("g").call(yAxis);

  // add x axis titles by calling addAxisTitle() function depending on the condition of the active array list
  // passing parameters are the data set, text strings of active status (used for css styling), axis titles and the axis (x or y), 
  // numerical list values per axis title, and the offset placement in pixels from the chart  
  // after function called and completed, set the tooltip title variables (xtip or ytip) to display before the values
  if (active[0] == 0) {
    addAxisTitle(data, "In Poverty (%)", "x", 0, 12, "active");
    xtip = "Poverty: ";
  }
  else
    addAxisTitle(data, "In Poverty (%)", "x", 0, 12, "inactive");

  if (active[0] == 1) {
    addAxisTitle(data, "Age (median)", "x", 1, 32, "active");
    xtip = "Age: ";
  }
  else
    addAxisTitle(data, "Age (median)", "x", 1, 32, "inactive");

  if (active[0] == 2) {
    addAxisTitle(data, "Household Income (median)", "x", 2, 52, "active");
    xtip = "Income: ";
  }
  else
    addAxisTitle(data, "Household Income (median)", "x", 2, 52, "inactive");

  // add y axis titles by calling addAxisTitle() function depending on the condition of the active array list
  // use same logic as for x axis noted above
  if (active[1] == 0) {
    addAxisTitle(data, "Lacks Healthcare (%)", "y", 0, 8, "active");
    ytip = "Healthcare: ";
  }
  else
    addAxisTitle(data, "Lacks Healthcare (%)", "y", 0, 8, "inactive");

  if (active[1] == 1) {
    addAxisTitle(data, "Smokes (%)", "y", 1, 6.7, "active");
    ytip = "Smokes: ";
  }
  else
    addAxisTitle(data, "Smokes (%)", "y", 1, 6.7, "inactive");

  if (active[1] == 2) {
    addAxisTitle(data, "Obese (%)", "y", 2, 5, "active");
    ytip = "Obesity: ";
  }
  else
    addAxisTitle(data, "Obese (%)", "y", 2, 5, "inactive");

  // apply a tooltip formatter to display data nicely for income and by rounding age to whole number
  var incFormat = d3.format("$,");
  var ageFormat = d3.format(".2");

  // add tooltips using d3.tip() library and by defining a toolTip object variable
  // display full state name instead of the abbreviations shown within the circle
  // apply tooltip styling format condition depending on the data value (dollar for incomes, whole number for ages, and percent for fractions) 
  if (xtip == "Income: ")
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .direction('e')
      .html(function (d) {
        return (`<strong>${d.stateFull}</strong><br>${xtip}${incFormat(d.x_axis)}<br>${ytip}${d.y_axis}%`);
      });
  else if (xtip == "Age: ")
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .direction('e')
      .html(function (d) {
        return (`<strong>${d.stateFull}</strong><br>${xtip}${ageFormat(d.x_axis)}<br>${ytip}${d.y_axis}%`);
      });
  else
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .direction('e')
      .html(function (d) {
        return (`<strong>${d.stateFull}</strong><br>${xtip}${d.x_axis}%<br>${ytip}${d.y_axis}%`);
      });

  // apply the object variable defined above to the chartGroup by using .call() method
  chartGroup.call(toolTip);

  // add circle data elements to the chartGroup and apply an event listener for hovering the mouse over each as selected
  // for showing or hiding that circles tooltip
  // append to a "circle" tag on the html page and apply css styling by defining its class name
  // circle radius is a defined constant number and its coordinates will be to the scales defined above
  chartGroup.selectAll("svg")
    .data(circles)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xScale(d.x_axis))
    .attr("cy", d => yScale(d.y_axis))
    .attr("r", 9)
    .on("mouseover", function (d) { toolTip.show(d, this); })
    .on("mouseout", function (d) { toolTip.hide(d, this); });

  // add state abbreviations inside circle data elements to the chartGroup and apply the same logic as above
  // except to append to a "text" tag and add a slight offset to y coordinate to display evenly within the circle
  chartGroup.selectAll("svg")
    .data(circles)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("dx", d => xScale(d.x_axis))
    .attr("dy", d => yScale(d.y_axis) + 3)
    .attr("font-size", 8)
    .text(d => d.state)
    .on("mouseover", function (d) { toolTip.show(d, this); })
    .on("mouseout", function (d) { toolTip.hide(d, this); });
} //end buildPlot()

// function to overwrite elements and contents on the demographics chart and summary below using d3.select
// replaces current chart and content on html used for different content selection
// called from init() function
// no parameter is passed
function removeDemo() {

  d3.select("g").selectAll("text").remove();
  d3.select("g").selectAll("circle").remove();
  d3.select("g").selectAll(".tick").remove();
  d3.select("g").selectAll("g").remove();
  d3.select(".d3-tip").remove();
  d3.selectAll("p").remove();
} //end removeDemo()

// function to overwrite current axis titles, values and 
// to change active array depending on user selection, and then re-passing it back as a parameter to the init() function
// parameters passed in are the data set, text strings of active status (used for css styling), axis titles and the axis (x or y), 
// numerical list values per axis title, and the offset placement in pixels from the chart    
// called from buildPlot() function
function addAxisTitle(data, text, axis, axisdata, offset, status) {

  // assign translation text string depending on the axis parameter passed in
  // for x axis titles display it below the axis horizontally in the middle
  // for y axis titles display it left of the axis vertically by rotating it 90 degrees in the middle
  if (axis == "x")
    transText = `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + offset})`;
  else
    transText = `translate(${-chartMargin.left + (offset * offset)}, ${chartHeight / 2 - offset}) rotate(-90)`;

  // add axis titles to the chartGroup
  // append to a "text" tag on the html page, and 
  // apply an id attribute to a concatenated string of the axis and list value (axisdata) passed within the function,
  // id attribute is used for d3.select finding
  // apply css styling by defining its class names, and 
  // apply a text value to the axis title passed within the function as a parameter
  chartGroup.append("text")
    .attr("transform", transText)
    .attr("id", axis + axisdata)
    .classed("aText", true)
    .classed(status, true)
    .text(text)
    // add the event listeners for clicking each axis titles to change the chart content by calling the init() function
    // apply a condition depending on the axis title clicked by using its id attribute and "active" class name to
    // pass within init() function an active array list consisting of the passed in axisdata and
    // a hard coded list value (0,1,2) representing the title
    .on("click", function () {
      d3.select(this).classed(status, true)
      if (d3.select(this).attr("id").charAt(0) == "x") {
        if (d3.select("#y0").attr("class").substring(6, 12) == "active")
          init(data, [axisdata, 0])
        if (d3.select("#y1").attr("class").substring(6, 12) == "active")
          init(data, [axisdata, 1])
        if (d3.select("#y2").attr("class").substring(6, 12) == "active")
          init(data, [axisdata, 2])
      }
      else {
        if (d3.select("#x0").attr("class").substring(6, 12) == "active")
          init(data, [0, axisdata])
        if (d3.select("#x1").attr("class").substring(6, 12) == "active")
          init(data, [1, axisdata])
        if (d3.select("#x2").attr("class").substring(6, 12) == "active")
          init(data, [2, axisdata])
      }
    })
    // add the event listener for hovering the mouse over each axis title so to change its css styling using 
    // the status that is passed within the function
    .on("mouseover", function () {
      d3.select(this).classed(status, true)
    })
    // add the event listener for hovering the mouse away from the axis title so to change its css styling using
    // the status that is passed within the function
    .on("mouseout", function () {
      d3.select(this).classed(status, true);
    });
} //end addAxisTitle()

// function to add a description summary report below the chart passing in the active array list, used
// for the content of the description that is stored in a separate CSV data
// called from init() function  
function addSummary(active) {
  // Fetch the CSV summary using d3 library and call an annonymous function passing it as an articles element
  d3.csv("./data/summary.csv").then(function (articles) {
    
    // initialize a summaries array list    
    summaries = [];
    // loop through each record of the articles element to append the content to the summaries array list
    // apply a condition depending on the active array list values to determine which article summary to append to by
    // defining and equating to the x and y id values read from the CSV summary, 
    // pg is defined for the actual paragraph number used for a potential future revision    
    articles.forEach(function (data) {
      data.x = +data.xid;
      data.y = +data.yid;
      data.pg = +data.paragraph;
      if ((data.x == active[0]) && (data.y == active[1]))
        summaries.push(data.summary);
    });
    // loop through each record of the summaries array list to append a "p" tag to the articles div class on the html page
    // apply a text value to the specific article summary 
    summaries.forEach(function (summary) {
      d3.select(".article").append("p").text(summary);
    });
  });
} //end addSummary()

// YOUR CODE HERE!
console.log('This is censusDemo d3 js file - Reza Abasaltian');

// Fetch the CSV data using d3 library and call function init() on application startup 
// passing it as a data element and a default active array list (0,0)
d3.csv("./data/data.csv").then(data => init(data, [0, 0]));