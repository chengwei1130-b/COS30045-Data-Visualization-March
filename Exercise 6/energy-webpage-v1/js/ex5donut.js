(() => {
/**
 * ex5-donut.js
 * Donut chart: Mean annual energy consumption by screen technology (all screen sizes)
 * Source: data/Ex5_TV_Allsizes_byScreenType.csv
 */

d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", d => ({
  tech: d["Screen_Tech"],
  mean: +d["Mean(Labelled energy consumption (kWh/year))"]
})).then(data => {

  const container = d3.select("#chart-donut");
  const totalW = Math.max(container.node().clientWidth, 500);
  const size   = Math.min(totalW, 460);
  const radius = size / 2 - 40;
  const innerR = radius * 0.5;

  const colour = d3.scaleOrdinal()
    .domain(data.map(d => d.tech))
    .range(["#5470C6", "#91CC75", "#EE6666"]);

  const svg = container.append("svg")
    .attr("width", totalW)
    .attr("height", size + 30);

  // Title
  svg.append("text")
    .attr("x", totalW / 2).attr("y", 20)
    .attr("text-anchor", "middle").attr("font-size", "16px").attr("font-weight", "700")
    .text("Mean Energy Consumption by Screen Technology (All Sizes)");

  const g = svg.append("g")
    .attr("transform", `translate(${size / 2},${size / 2 + 24})`);

  const pie  = d3.pie().value(d => d.mean).sort(null);
  const arc  = d3.arc().innerRadius(innerR).outerRadius(radius);
  const total = d3.sum(data, d => d.mean);

  // Slices
  const arcs = g.selectAll(".arc")
    .data(pie(data))
    .join("g")
      .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => colour(d.data.tech))
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Slice labels
  const labelArc = d3.arc().innerRadius(radius * 0.75).outerRadius(radius * 0.75);

  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "600")
    .text(d => `${d.data.tech}: ${((d.data.mean / total) * 100).toFixed(1)}%`);

  // Centre label
  g.append("text")
    .attr("text-anchor", "middle").attr("dy", "-0.3em")
    .attr("font-size", "14px").attr("font-weight", "700")
    .text(total.toFixed(0) + " kWh");

  g.append("text")
    .attr("text-anchor", "middle").attr("dy", "1.1em")
    .attr("font-size", "11px").attr("fill", "#555")
    .text("total avg/yr");

  // Legend (right of donut)
  const legendX = size + 20;
  const legend  = svg.append("g")
    .attr("transform", `translate(${legendX}, ${size / 2})`);

  data.forEach((d, i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 26})`);
    row.append("rect").attr("width", 14).attr("height", 14)
      .attr("fill", colour(d.tech));
    row.append("text").attr("x", 20).attr("y", 11)
      .attr("font-size", "12px")
      .text(`${d.tech} — ${d.mean.toFixed(1)} kWh/yr`);
  });

}).catch(err => {
  document.getElementById("chart-donut").innerHTML =
    `<p style="color:red">Error loading donut data: ${err.message}</p>`;
});
})();