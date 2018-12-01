import './styles.css'
// import { render as renderBarChart } from './barchart'
import { render as renderPieChart } from './piechart'
// import { render as renderSparkline } from './sparkline'
// import { render as renderLineChart } from './linechart'

// renderBarChart()
renderPieChart(
  '#piechart',
  [
    { label: 'Unscheduled', count: 112, color: 'rgb(26,132,217)' },
    { label: 'Scheduled', count: 56, color: 'rgb(103,174,35)' },
    { label: 'Missed', count: 2, color: 'rgb(253,148,54)' },
    { label: 'Re-Checks', count: 10, color: 'rgb(153,153,153)' },
  ],
  {
    legendTitle: 'Completion',
  }
)
// renderSparkline()
// renderLineChart()
