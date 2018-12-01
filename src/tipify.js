import { event, select } from 'd3'

function tipify() {
  const tooltipEl = select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('pointer-events', 'none')
    .style('opacity', 0)

  return (selection, html) => {
    selection
      .on('mouseover.tooltip', d => {
        tooltipEl
          .transition()
          .duration(200)
          .style('opacity', 0.9)
        tooltipEl
          .html(html(d))
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`)
      })
      .on('mouseout.tooltip', d => {
        tooltipEl
          .transition()
          .duration(500)
          .style('opacity', 0)
      })
  }
}

export default tipify
