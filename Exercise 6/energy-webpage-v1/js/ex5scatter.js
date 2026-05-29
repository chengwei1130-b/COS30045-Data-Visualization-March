(() => {
/**
 * ex5-scatter.js
 * Scatter plot: Year vs electricity spot price per state
 * Source: data/Ex5_ARE_Spot_Prices.csv
 */

const SPOT_STATES = [
  { col: "Queensland ($ per megawatt hour)",      label: "QLD", colour: "#5470C6" },
  { col: "New South Wales ($ per megawatt hour)", label: "NSW", colour: "#91CC75" },
  { col: "Victoria ($ per megawatt hour)",        label: "VIC", colour: "#FAC858" },
  { col: "South Australia ($ per megawatt hour)", label: "SA",  colour: "#EE6666" },
  { col: "Tasmania ($ per megawatt hour)",        label: "TAS", colour: "#73C0DE" }
];

d3.csv("data/Ex5_ARE_Spot_Prices.csv", d => {
  const row = { year: +d["Year"] };
  SPOT_STATES.forEach(s => {
    const v = d[s.col];
    row[s.col] = (v === "" || v == null) ? null : +v;
  });
  return row;
}).then(data => {

  const container = d3.select("#chart-scatter");
  const margin = { top: 40, right: 30, bottom: 70, left: 70 };
  const width  = Math.max(container.node().clientWidth, 700);
  const height = 460;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Flatten data into one point per state per year
  const points = [];
  data.forEach(row => {
    SPOT_STATES.forEach(s => {
      if (row[s.col] !== null) {
        points.push({ year: row.year, price: row[s.col], state: s.label, colour: s.colour });
      }
    });
  });

  const allValues = points.map(d => d.price);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(points, d => d.year)).nice()
    .range([0, innerW]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(allValues) * 1.1]).nice()
    .range([innerH, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(13).tickFormat(d3.format("d")).tickSizeOuter(0))
    .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .attr("dx", "-0.4em").attr("dy", "0.2em")
      .style("font-size", "11px");

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(6))
    .selectAll("text").style("font-size", "12px");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2).attr("y", height - 4)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", 16)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Price ($ per MWh)");

  // Title
  svg.append("text")
    .attr("x", width / 2).attr("y", margin.top / 2)
    .attr("text-anchor", "middle").attr("font-size", "16px").attr("font-weight", "700")
    .text("Australian Electricity Spot Prices by State (1998–2024)");

  // Dots
  g.selectAll(".dot")
    .data(points)
    .join("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.price))
      .attr("r", 5)
      .attr("fill", d => d.colour)
      .attr("opacity", 0.75);

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + 20},${margin.top + 10})`);

  SPOT_STATES.forEach((s, i) => {
    const row = legend.append("g").attr("transform", `translate(${i * 68}, 0)`);
    row.append("circle").attr("r", 5).attr("cx", 6).attr("cy", 6)
      .attr("fill", s.colour).attr("opacity", 0.8);
    row.append("text").attr("x", 15).attr("y", 10)
      .attr("font-size", "12px").text(s.label);
  });

}).catch(err => {
  document.getElementById("chart-scatter").innerHTML =
    `<p style="color:red">Error loading scatter data: ${err.message}</p>`;
});
})();