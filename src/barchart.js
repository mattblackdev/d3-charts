import * as d3 from 'd3'
import tipify from './tipify'

const data = [
  {
    day: 'Sun',
    none: 5,
    slow: 2,
    ok: 6,
  },
  {
    day: 'Mon',
    none: 3,
    slow: 2,
    ok: 12,
  },
  {
    day: 'Tue',
    none: 1,
    slow: 3,
    ok: 10,
  },
  {
    day: 'Wed',
    none: 2,
    slow: 5,
    ok: 8,
  },
  {
    day: 'Thu',
    none: 2,
    slow: 3,
    ok: 11,
  },
  {
    day: 'Fri',
    none: 1,
    slow: 4,
    ok: 14,
  },
  {
    day: 'Sat',
    none: 3,
    slow: 8,
    ok: 5,
  },
]

// Translate data
data.forEach(d => (d.total = d.none + d.slow + d.ok))

// Positioning
const margin = { top: 10, right: 10, bottom: 150, left: 100 }
const svgWidth = 1000
const svgHeight = 400
const width = svgWidth - margin.left - margin.right
const height = svgHeight - margin.top - margin.bottom

// Root
const root = d3
  .select('#barchart')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// Scale
const x = d3
  .scaleBand()
  .range([0, width])
  .paddingInner(0.2)
  .paddingOuter(0.2)

const y = d3.scaleLinear().range([height, 0])

// Axis
const xAxisGroup = root
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${height})`)

const yAxisGroup = root.append('g').attr('class', 'y-axis')

// Gridlines
const yAxisGridLinesGroup = root.append('g').attr('class', 'grid')

// Tooltip element
const tipifyCall = tipify()

// Updates
function update(data) {
  // Scale
  x.domain(data.map(d => d.day))

  let yMax = d3.max(data, d => d.total)
  yMax = Math.ceil(yMax * 1.5)
  y.domain([0, yMax])

  // Axis
  const yTicks = Math.ceil(yMax / 2)

  const yAxisGridCall = d3
    .axisLeft(y)
    .ticks(yTicks)
    .tickSize(-width)
    .tickSizeOuter(0)
    .tickFormat('')
  yAxisGridLinesGroup.call(yAxisGridCall)

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(yTicks)
    .tickSize(0)
    .tickSizeOuter(0)
    .tickPadding(10)

  yAxisGroup
    .call(yAxisCall)
    .selectAll('text')
    .attr('font-size', '13px')

  const xAxisCall = d3.axisBottom(x).tickSize(0)
  xAxisGroup
    .call(xAxisCall)
    .selectAll('text')
    .attr('y', '10')
    .attr('text-anchor', 'middle')
    .attr('font-size', '13px')

  // helpers
  const day = d => x(d.day)
  const ok = d => y(d.ok)
  const slow = d => y(d.slow)
  const none = d => y(d.none)
  const total = d => y(d.total)
  const bw = x.bandwidth
  const pad = 0

  // Draw
  const enter = root
    .selectAll('rect')
    .data(data)
    .enter()
  // Total num
  const totalText = enter
    .append('text')
    .attr('x', d => day(d) + bw() / 2)
    .attr('y', d => total(d) - 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', '13px')
    .text(d => d.total)

  // No response
  const noResponseRects = enter
    .append('rect')
    .attr('fill', 'rgb(251,12,9)')
    .attr('x', day)
    .attr('y', d => total(d) + pad)
    .attr('width', bw)
    .attr('height', d => Math.max(height - none(d) - pad, 0)) // no response amount
  // Slow
  const slowRects = enter
    .append('rect')
    .attr('fill', 'rgb(254,204,0)')
    .attr('x', day)
    .attr('y', d => y(d.ok + d.slow) + pad)
    .attr('width', bw)
    .attr('height', d => Math.max(height - slow(d) - pad, 0))
  // Okay
  const okayRects = enter
    .append('rect')
    .attr('fill', 'rgb(102,176,0)')
    .attr('x', day)
    .attr('y', d => ok(d) + pad)
    .attr('width', bw)
    .attr('height', d => Math.max(height - ok(d) - pad, 0))

  // Tipify
  tipifyCall(noResponseRects, d => `No Resp: ${d.none}`)
  tipifyCall(slowRects, d => `Slow: ${d.slow}`)
  tipifyCall(okayRects, d => `On-Time: ${d.ok}`)
}

// const loop = setInterval(update(data), 1000)
export function render() {
  update(data)
}
