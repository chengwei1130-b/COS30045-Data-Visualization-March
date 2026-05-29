(() => {
/**
 * ex5-bar.js
 * Bar chart: Mean annual energy consumption by screen technology for 55-inch TVs
 * Source: data/Ex5_TV_55inch_byScreenType.csv
 */

d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", d => ({
  tech: d["Screen_Tech"],
  mean: +d["Mean(Labelled energy consumption (kWh/year))"]
})).then(data => {

  const container = d3.select("#chart-bar");
  const margin = { top: 40, right: 30, bottom: 70, left: 70 };
  const width  = Math.max(container.node().clientWidth, 700);
  const height = 460;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const colour = d3.scaleOrdinal()
    .domain(data.map(d => d.tech))
    .range(["#5470C6", "#91CC75", "#EE6666"]);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.tech))
    .range([0, innerW])
    .padding(0.3);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mean) * 1.15]).nice()
    .range([innerH, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .selectAll("text").style("font-size", "13px");

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(6))
    .selectAll("text").style("font-size", "12px");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2).attr("y", height - 8)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Screen Technology");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", 16)
    .attr("text-anchor", "middle").attr("font-size", "12px")
    .text("Mean Energy Consumption (kWh/year)");

  // Title
  svg.append("text")
    .attr("x", width / 2).attr("y", margin.top / 2)
    .attr("text-anchor", "middle").attr("font-size", "16px").attr("font-weight", "700")
    .text("Energy Consumption by Screen Technology – 55-inch TVs");

  // Bars
  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.tech))
      .attr("y", d => yScale(d.mean))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerH - yScale(d.mean))
      .attr("fill", d => colour(d.tech));

  // Value labels
  g.selectAll(".label")
    .data(data)
    .join("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.tech) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.mean) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d.mean.toFixed(1));

}).catch(err => {
  document.getElementById("chart-bar").innerHTML =
    `<p style="color:red">Error loading bar chart data: ${err.message}</p>`;
});
})();