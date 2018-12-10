/*************************************************
 * D3 Charts for Restroom Alert
 *
 * Author: Matt Black (mb@mattblack.io)
 * Created: 2018-12-06
 *
 * Changes:
 *
 */
// import * as d3 from 'd3';

/**
 * Make a chart responsive to it's parent container size
 * @param {*} svg
 */
export function responsify(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid')
    .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on('resize.' + container.attr('id'), resize);

  // get width of container and resize svg to fit it
  function resize() {
    var targetWidth = parseInt(container.style('width'));
    svg.attr('width', targetWidth);
    svg.attr('height', Math.round(targetWidth / aspect));
  }
}

/**
 * Creates a tooltip generator for d3 elements
 * @returns function(selection: d3.Selection, html: Function(d: Object): String) to associate an element with tooltip content
 */
export function tipify() {
  // Append a tooltip div
  const tooltipEl = d3
    .select('body')
    .append('div')
    .attr('class', 'rac-tooltip')
    .attr('pointer-events', 'none')
    .style('opacity', 0);

  function mouseMove() {
    tooltipEl
      .style('left', `${d3.event.pageX + 15}px`)
      .style('top', `${d3.event.pageY + 5}px`);
  }

  // Call this to make any html element show a tooltip on mouseover
  // html should be a function that accepts the data object and returns the html to render inside the tooltip
  return function(selection, html) {
    selection
      .on('mouseover.tooltip', d => {
        tooltipEl
          .html(html(d))
          .style('left', `${d3.event.pageX + 15}px`)
          .style('top', `${d3.event.pageY + 5}px`)
          .transition()
          .duration(200)
          .style('opacity', 0.9);

        d3.select(window).on('mousemove.tooltip', mouseMove);
      })
      .on('mouseout.tooltip', () => {
        tooltipEl
          .transition()
          .duration(500)
          .style('opacity', 0);
        d3.select(window).on('mousemove.tooltip', null);
      });
  };
}

/********************************************************************
 *
 *                      ***** PIE CHART *****
 *
 * Renders an opinionated interactive piechart with d3
 *
 * @param {string} svgId - id of the svg to append the chart graphics to
 * @param {Object[]} data - data array to present, should include properties: label: string, count: number, color: string
 * @param {Object} options - presentation options
 * @returns {Function} the update function to call with new data
 */
export function initializePieChart(divId, data = [], options = {}) {
  // Options
  const width = options.width || 500; // total width of the parent svg
  const height = options.height || 300; // total height of the parent svg
  const margin = options.margin || 20; // margin of the pie chart should be greater than 0
  const legendTitleFontSize = options.legendTitleFontSize || 20;
  const legendCircleRadius = options.legendCircleRadius || 10;
  const legendItemSpacing = options.legendItemSpacing || 20;
  const legendTitleMargin = options.legendTitleMargin || 30;
  const legendTopMargin = options.legendTopMargin || 0;
  const legendLeftMargin = options.legendLeftMargin || 0;
  const responsive = options.responsive; // makes the chart responsive
  const fontFamily = options.fontFamily || 'Roboto';
  const labelColor = options.labelColor || 'white';
  const legendItemTextClass =
    options.legendItemTextClass || 'rac-legend-item-text';
  const legendItemCircleClass =
    options.legendItemCircleClass || 'rac-legend-item-circle';
  const labelClass = options.labelClass || 'rac-piechart-label';
  const legendTitleClass = options.legendTitleClass || 'rac-legend-title';
  const sort = options.sort;
  const noDataImageUrl = options.noDataImageUrl;
  const noDataImageClass =
    options.noDataImageClass || 'rac-piechart-no-data-image';

  const size = Math.min(width, height);
  const radius = size / 2 - margin;
  const tipifyThePieSlices = tipify(); // Initilize tipify

  const svg = d3
    .select(divId)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  if (responsive) {
    svg.call(responsify);
  }

  const g = svg
    .append('g') // Append a g element for the pie chart
    .attr('width', size)
    .attr('height', size)
    .attr('transform', `translate(${size / 2},${size / 2})`); // Translate it into the proper position

  // Append an image to display if there's no data
  let noDataImage;
  if (noDataImageUrl) {
    noDataImage = g
      .append('image')
      .attr('href', noDataImageUrl)
      .attr('class', noDataImageClass)
      .attr('width', radius * 2)
      .attr('height', radius * 2)
      .attr('x', -radius)
      .attr('y', -radius);
  }

  // Append a g element for the legend
  const legendX = size + margin + legendLeftMargin;
  const legendY = margin + legendTopMargin;
  const legend = svg
    .append('g')
    .attr('transform', `translate(${legendX}, ${legendY})`);

  // Initialize the pie generator
  const pie = d3.pie().value(d => d.count);

  if (sort !== undefined) {
    // if sort === null d3 will not do default sorting
    pie.sort(sort);
  }

  // Initialize the path generator for the pie chart
  const path = d3
    .arc()
    .outerRadius(radius)
    .innerRadius(0);

  // Initialize animation generator functions
  // These make the slices expand/contract on hover
  const pathIn = d3
    .arc()
    .outerRadius(radius + margin / 2)
    .innerRadius(0);
  function pathEnter() {
    d3.select(this)
      .transition()
      .duration(800)
      .ease(d3.easeElastic)
      .attr('d', pathIn);
  }
  function pathOut() {
    d3.select(this)
      .transition()
      .attr('d', path);
  }

  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return path(i(t));
    };
  }

  // Label helpers
  const labelCenterArc = d3
    .arc()
    .outerRadius(radius)
    .innerRadius(radius / 1.8);

  // translates text to the arc center
  const labelTransform = d => `translate(${labelCenterArc.centroid(d)})`;

  // calculates the percentage based on the arc itself
  const labelText = d =>
    d.data.count
      ? `${Math.round(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100)}%`
      : '';

  function labelArcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return `translate(${labelCenterArc.centroid(i(t))})`;
    };
  }

  function checkNoData(data) {
    if (!noDataImage) return;
    const noData = d3.sum(data, d => d.count) === 0;
    noDataImage.transition().attr('opacity', noData ? 1 : 0);
  }

  // ******* RENDER ********
  checkNoData(data);
  const pieData = pie(data);
  const keyFn = d => d.data.label;
  // Pie slices
  const slices = g
    .selectAll('rac-piechart-slice')
    .data(pieData, keyFn)
    .enter()
    .append('path')
    .attr('class', 'rac-piechart-slice')
    .attr('d', path)
    .attr('fill', d => d.data.color)
    .each(function(d) {
      this._current = d;
    }); // store the initial angles

  // Update transition
  slices
    .transition()
    .duration(500)
    .attrTween('d', arcTween);

  // Hover transitions
  slices.on('mouseenter', pathEnter).on('mouseout', pathOut);

  // Add tooltips to the pie slices
  tipifyThePieSlices(slices, d => `${d.data.count} ${d.data.label}`);

  // Add Labels
  const labels = g
    .selectAll(labelClass)
    .data(pieData, keyFn)
    .enter()
    .append('text')
    .text(labelText) // add the text
    .attr('class', labelClass)
    .attr('dy', '.35em') // pulls text down half its line-height to center vertically
    .attr('text-anchor', 'middle') // centers text horizontally
    .attr('pointer-events', 'none') // passes mouse events through so mouseout is not called when hovering over text
    .attr('transform', labelTransform) // place text at the arc "centroid"
    .style('font-family', fontFamily)
    .style('fill', labelColor)
    .style('user-select', 'none')
    .each(function(d) {
      this._current = d;
    }); // store the initial angles

  // Legend Title
  legend
    .selectAll(legendTitleClass)
    .data([{ legendTitle: options.legendTitle }])
    .enter()
    .append('text')
    .text(d => d.legendTitle)
    .attr('class', legendTitleClass)
    .attr('transform', `translate(0, ${margin})`)
    .attr('font-size', legendTitleFontSize)
    .style('font-family', fontFamily);

  // Legend Colors
  legend
    .selectAll(legendItemCircleClass)
    .data(pieData)
    .enter()
    .append('circle')
    .attr('class', legendItemCircleClass)
    .attr('r', legendCircleRadius)
    .attr('fill', d => d.data.color)
    .attr(
      'transform',
      (d, i) =>
        `translate(${legendCircleRadius}, ${i *
          (legendCircleRadius + legendItemSpacing) +
          legendTitleMargin +
          margin})`
    );

  // Legend Labels
  legend
    .selectAll(legendItemTextClass)
    .data(pieData)
    .enter()
    .append('text')
    .text(d => d.data.label)
    .attr('class', legendItemTextClass)
    .attr(
      'transform',
      (d, i) =>
        `translate(30, ${i * (legendCircleRadius + legendItemSpacing) +
          legendTitleMargin +
          margin +
          legendCircleRadius / 2})`
    )
    .style('font-family', fontFamily);

  // main update function to call with new data as it changes
  function update(data) {
    checkNoData(data);
    const pieData = pie(data);
    slices
      .data(pieData, keyFn)
      .transition()
      .duration(500)
      .attrTween('d', arcTween);
    labels
      .data(pieData, keyFn)
      .text(labelText)
      .transition()
      .duration(500)
      .attrTween('transform', labelArcTween);
  }
  return update;
}
