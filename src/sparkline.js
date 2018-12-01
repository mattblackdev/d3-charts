import * as d3 from 'd3'
import trend from 'trend'

const dataset = [
  { value: 3 },
  { value: 4 },
  { value: 2 },
  { value: 6 },
  { value: 3 },
  { value: 8 },
]

const datasetNeg = [
  { value: 4 },
  { value: 4 },
  { value: 6 },
  { value: 3 },
  { value: 2 },
  { value: 2 },
]

const datasetNeutral = [
  { value: 0 },
  { value: 0 },
  { value: 0 },
  { value: 0 },
  { value: 0 },
  { value: 0 },
]

const width = 100
const height = 25

// scale
const xScale = d3.scaleLinear().rangeRound([5, width - 5])
const yScale = d3.scaleLinear().rangeRound([height - 8, 8])

const line = d3
  .line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d.value))
  .curve(d3.curveLinear)

function getColor(growth) {
  if (growth > 1) {
    return 'green'
  }
  if (growth < 1) {
    return 'red'
  }
  return '#999'
}

export default function sparkline(elemId, data) {
  const growth = trend(data.map(d => d.value), {
    avgPoints: 5,
    lastPoints: 1,
  })

  const pathColor = getColor(growth)

  xScale.domain([0, data.length - 1])
  yScale.domain(d3.extent(data, d => d.value))

  const svg = d3
    .select(elemId)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'sparkline')
  const g = svg.append('g').attr('transform', 'translate(0, 2)')
  g
    .append('path')
    .datum(data)
    .attr('class', 'sparkline')
    .attr('fill', 'none')
    .attr('stroke', pathColor)
    .attr('stroke-width', 2)
    .attr('d', line)

  const circles = g
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('opacity', '0')
    .attr('r', '3')
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', d => yScale(d.value))
    .attr('fill', pathColor)
    .attr('stroke', 'none')

  svg.on('mouseover', () => circles.transition().attr('opacity', 0.9))
  svg.on('mouseout', () => circles.transition().attr('opacity', 0))
}

export function render() {
  sparkline('#sparks', dataset)
  sparkline('#sparks', datasetNeg)
  sparkline('#sparks', datasetNeutral)
}
