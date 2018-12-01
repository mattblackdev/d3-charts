import * as d3 from 'd3'
import moment from 'moment'
import generateData from './generateData'

const alertsPerDay = generateData({
  start: 50,
  end: 10,
  days: 365,
  variance: 10,
})
const date = moment().add(-1, 'year')
const dataset = alertsPerDay.map((alerts, i) => ({
  date: date.add(i, 'days').format('MM/DD/YYYY'),
  value: alerts,
}))
console.log(dataset)

const width = 1000
const height = 400

// scale
const xScale = d3.scaleLinear().rangeRound([5, width - 5])
const yScale = d3.scaleLinear().rangeRound([height - 8, 8])

const line = d3
  .line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d.value))
// .curve(d3.curveBasis)

export default function linechart(elemId, data) {
  const pathColor = '#000' //getColor(growth)

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
  linechart('#linechart', dataset)
}
