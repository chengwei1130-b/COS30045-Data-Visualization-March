(() => {
/**
 * ex5-line.js
 * Line chart: Average energy consumption by screen size, one line per screen technology
 * Source: data/Ex5_TV_energy.csv
 */

d3.csv("data/Ex5_TV_energy.csv", d => ({
  screen_tech:     d.screen_tech,
  screensize:      +d.screensize,
  energy_consumpt: +d.energy_consumpt
})).then(rawData => {

  // Aggregate: mean energy per screen_tech + screensize
  const grouped = d3.rollup(
    rawData,
    v => d3.mean(v, d => d.energy_consumpt),
    d => d.screen_tech,
    d => d.screensize
  );

  // Convert to array of series: [{ tech, values: [{size, avg}] }]
  const series = Array.from(grouped, ([tech, sizeMap]) => ({
    tech,
    values: Array.from(sizeMap, ([size, avg]) => ({ size, avg }))
              .sort((a, b) => a.size - b.size)
  }));

  const TECHS   = ["LCD", "LCD (LED)", "OLED"];
  const COLOURS = { "LCD": "#5470C6", "LCD (LED)": "#91CC75", "OLED": "#EE6666" };

  const container = d3.select("#chart-line");
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

  // Scales
  const allSizes  = rawData.map(d => d.screensize);
  const allValues = series.flatMap(s => s.values.map(v => v.avg));

  const xScale = d3.scaleLinear()
    .domain(d3.extent(allSizes)).nice()
    .range([0, innerW]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(allValues) * 1.1]).nice()
    .range([innerH, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => d + '"').tickSizeOuter(0))
    .selectAll("text").style("font-size", "12px");

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(6))
    .selectAll("text").style("font-size", "12px");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2).attr("y", height - 4)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Screen Size (inches)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", 16)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Mean Energy Consumption (kWh/year)");

  // Title
  svg.append("text")
    .attr("x", width / 2).attr("y", margin.top / 2)
    .attr("text-anchor", "middle").attr("font-size", "16px").attr("font-weight", "700")
    .text("Mean Energy Consumption by Screen Size and Technology");

  // Line generator
  const line = d3.line()
    .x(d => xScale(d.size))
    .y(d => yScale(d.avg))
    .curve(d3.curveMonotoneX);

  // Draw one line per technology
  series.forEach(s => {
    const col = COLOURS[s.tech] || "#999";
    g.append("path")
      .datum(s.values)
      .attr("fill", "none")
      .attr("stroke", col)
      .attr("stroke-width", 2)
      .attr("d", line);
  });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + 20},${margin.top + 10})`);

  series.forEach((s, i) => {
    const col = COLOURS[s.tech] || "#999";
    const row = legend.append("g").attr("transform", `translate(${i * 110}, 0)`);
    row.append("line")
      .attr("x1", 0).attr("x2", 18).attr("y1", 7).attr("y2", 7)
      .attr("stroke", col).attr("stroke-width", 2);
    row.append("text").attr("x", 22).attr("y", 11)
      .attr("font-size", "12px").text(s.tech);
  });

}).catch(err => {
  document.getElementById("chart-line").innerHTML =
    `<p style="color:red">Error loading line chart data: ${err.message}</p>`;
});
})();