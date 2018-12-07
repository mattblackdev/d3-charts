import { initializePieChart } from './ra-charts';
import noDataSvg from './no-data.svg';
import './styles.css';

const updatePieChart = initializePieChart(
  '#piechart',
  [
    { label: 'Unscheduled', count: 112, color: 'rgb(26,132,217)' },
    { label: 'Scheduled', count: 56, color: 'rgb(103,174,35)' },
    { label: 'Missed', count: 20, color: 'rgb(253,148,54)' },
    { label: 'Re-Checks', count: 10, color: 'rgb(153,153,153)' }
  ],
  {
    legendTitle: 'Completion',
    responsive: true,
    noDataImageUrl: noDataSvg
  }
);

document
  .getElementById('piechart-change-random')
  .addEventListener('click', randomUpdate);

document
  .getElementById('piechart-change-no-data')
  .addEventListener('click', noDataUpdate);

function randomUpdate() {
  updatePieChart([
    {
      label: 'Unscheduled',
      count: Math.floor(Math.random() * 100),
      color: 'rgb(26,132,217)'
    },
    {
      label: 'Scheduled',
      count: Math.floor(Math.random() * 100),
      color: 'rgb(103,174,35)'
    },
    {
      label: 'Missed',
      count: Math.floor(Math.random() * 100),
      color: 'rgb(253,148,54)'
    },
    {
      label: 'Re-Checks',
      count: Math.floor(Math.random() * 100),
      color: 'rgb(153,153,153)'
    }
  ]);
}

function noDataUpdate() {
  updatePieChart([
    {
      label: 'Unscheduled',
      count: 0,
      color: 'rgb(26,132,217)'
    },
    {
      label: 'Scheduled',
      count: 0,
      color: 'rgb(103,174,35)'
    },
    {
      label: 'Missed',
      count: 0,
      color: 'rgb(253,148,54)'
    },
    {
      label: 'Re-Checks',
      count: 0,
      color: 'rgb(153,153,153)'
    }
  ]);
  // updatePieChart([]);
}
