import * as d3 from 'd3'
import tipify from './tipify'

function pointIsInArc(pt, ptData, arc) {
  // Center of the arc is assumed to be 0,0
  // (pt.x, pt.y) are assumed to be relative to the center
  const r1 = arc.innerRadius()(ptData)
  const r2 = arc.outerRadius()(ptData)
  const theta1 = arc.startAngle()(ptData)
  const theta2 = arc.endAngle()(ptData)

  const dist = pt.x * pt.x + pt.y * pt.y
  let angle = Math.atan2(pt.x, -pt.y)

  angle = angle < 0 ? angle + Math.PI * 2 : angle

  return (
    r1 * r1 <= dist && dist <= r2 * r2 && theta1 <= angle && angle <= theta2
  )
}

/**
 * Renders an opinionated interactive piechart with d3
 *
 * @param {string} svgId - id of the svg to append the chart graphics to
 * @param {Object[]} dataset - data array to present, should include properties: label: string, count: number, color: string
 * @param {Object} options - presentation options
 * @returns {Function} the update function to call with new data
 */
export function render(svgId, dataset = [], options = {}) {
  // Options
  const width = options.width || 500 // total width of the parent svg
  const height = options.height || 300 // total height of the parent svg
  const margin = options.margin || 20 // margin of the pie chart should be greater than 0
  const legendTitleFontSize = options.legendTitleFontSize || 20
  const legendCircleRadius = options.legendCircleRadius || 10
  const legendItemSpacing = options.legendItemSpacing || 20
  const legendTitleMargin = options.legendTitleMargin || 30
  const legendTopMargin = options.legendTopMargin || 0
  const legendLeftMargin = options.legendLeftMargin || 0

  const svg = d3.select(svgId)
  const size = Math.min(width, height)
  const radius = size / 2 - margin

  const g = svg
    .attr('width', width) // Apply width and height to the svg
    .attr('height', height)
    .append('g') // Append a g element for the pie chart
    .attr('width', size)
    .attr('height', size)
    .attr('transform', `translate(${size / 2},${size / 2})`) // Translate it into the proper position

  // Append a g element for the legend
  const legendX = size + margin + legendLeftMargin
  const legendY = margin + legendTopMargin
  const legend = svg
    .append('g')
    .attr('transform', `translate(${legendX}, ${legendY})`)

  // Initialize the pie generator
  const pie = d3
    .pie()
    .sort(null)
    .value(d => d.count)

  // Initialize the path generator for the pie chart
  const path = d3
    .arc()
    .outerRadius(radius)
    .innerRadius(0)

  // Initialize animation generator functions
  // These make the slices expand/contract on hover
  const pathIn = d3
    .arc()
    .outerRadius(radius + margin / 2)
    .innerRadius(0)
  function pathEnter() {
    d3.select(this)
      .transition()
      .attr('d', pathIn)
  }
  function pathOut() {
    d3.select(this)
      .transition()
      .attr('d', path)
  }

  // Label helpers
  const labelCenterArc = d3
    .arc()
    .outerRadius(radius / 1.8)
    .innerRadius(radius / 1.8)
  const labelOuterArc = d3
    .arc()
    .outerRadius(radius * 1.1)
    .innerRadius(radius * 1.1)

  const labelTransform = d =>
    `translate(${
      d.visible ? labelCenterArc.centroid(d) : labelOuterArc.centroid(d)
    })`
  const labelColor = d => (d.visible ? 'white' : 'black')

  // this calculates the percentage based on the arc itself
  const labelText = d =>
    `${Math.round(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100)}%`

  // Initilize tipify
  const tipifyCall = tipify()

  // This is the main update function to call with new data as it changes
  function update(data) {
    // Arcs
    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    // Add the paths
    const slices = arcs
      .append('path')
      .attr('d', path)
      .on('mouseenter', pathEnter) // hover transitions
      .on('mouseout', pathOut)
      .attr('fill', d => d.data.color)

    // Add Labels
    const labels = g
      .selectAll('.piechart-wedge-label')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('dy', '.35em') // pulls text down half its line-height to center vertically
      .attr('text-anchor', 'middle') // centers text horizontally
      .attr('pointer-events', 'none') // passes mouse events through so mouseout is not called when hovering over text
      .text(labelText) // add the text
      .each(function(d) {
        const bb = this.getBBox()
        const center = path.centroid(d)

        const topLeft = {
          x: center[0] + bb.x,
          y: center[1] + bb.y,
        }

        const topRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y,
        }

        const bottomLeft = {
          x: topLeft.x,
          y: topLeft.y + bb.height,
        }

        const bottomRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y + bb.height,
        }

        d.visible =
          pointIsInArc(topLeft, d, path) &&
          pointIsInArc(topRight, d, path) &&
          pointIsInArc(bottomLeft, d, path) &&
          pointIsInArc(bottomRight, d, path)
      })
      .attr('transform', labelTransform) // place text at the arc "centroid"
      .attr('class', 'piechart-wedge-label')
      .style('fill', labelColor)

    // Tipify the slices
    tipifyCall(slices, d => `${d.data.count} ${d.data.label}`)

    // Legend Title
    legend
      .selectAll('.legend-title')
      .data([{ legendTitle: options.legendTitle }])
      .enter()
      .append('text')
      .text(d => d.legendTitle)
      .attr('transform', `translate(0, ${margin})`)
      .attr('class', 'legend-title')
      .attr('font-size', legendTitleFontSize)

    // Legend Colors
    legend
      .selectAll('.legend-item-circle')
      .data(pie(data))
      .enter()
      .append('circle')
      .attr('class', 'legend-item-circle')
      .attr('r', legendCircleRadius)
      .attr('fill', d => d.data.color)
      .attr(
        'transform',
        (d, i) =>
          `translate(${legendCircleRadius}, ${i *
            (legendCircleRadius + legendItemSpacing) +
            legendTitleMargin +
            margin})`
      )

    // Legend Labels
    legend
      .selectAll('.legend-item-text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('class', 'legend-item-text')
      .text(d => d.data.label)
      .attr(
        'transform',
        (d, i) =>
          `translate(30, ${i * (legendCircleRadius + legendItemSpacing) +
            legendTitleMargin +
            margin +
            legendCircleRadius / 2})`
      )
  }

  update(dataset)
  return update
}
