import {useMemo} from 'react';

import {Line} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  registerables,
}             from 'chart.js';

import {enGB} from 'date-fns/locale';

ChartJS.register(
  ...registerables
);

const ApiUsageChart = ({usageResult}) => {

  const chartMeta = {
    no_data: {
      label: 'No data',
      colors: {
        borderColor: 'rgb(255, 156, 82)',
        backgroundColor: 'rgb(255, 156, 82, .25)'
      }
    },
    billing_period_invalid: {
      label: 'Billing Period Invalid',
      colors: {
        borderColor: 'rgb(255, 206, 169)',
        backgroundColor: 'rgb(255, 206, 169, .25)'
      }
    },
    usage_limit_reached: {
      label: 'Usage Limit Reached',
      colors: {
        borderColor: 'rgb(159, 203, 236)',
        backgroundColor: 'rgb(159, 203, 236, .25)'
      }
    },
    success: {
      label: 'Success',
      colors: {
        borderColor: 'rgb(132, 178, 158)',
        backgroundColor: 'rgb(132, 178, 158, .25)'
      }
    },
    total: {
      label: 'Total',
      colors: {
        borderColor: 'rgb(220, 221, 220)',
        backgroundColor: 'rgb(220, 221, 220, .25)'
      }
    }
  };

  const options = {
    scales: {
      y: {
        title: {display: true, text: 'Requests'}
      },
      x: {
        adapters: {
          date: {locale: enGB},
          type: 'time”',
          distribution: 'linear”',
          time: {
            parser: 'yyyy-MM-dd”',
            unit: 'month',
          },
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    },
  }

  const chartData = useMemo(() => {
    let potentialSeries = {};

    for (const result of usageResult) {
      for (const resultItem in result) {
        if (resultItem === 'request_day') {
          continue;
        }

        if (! potentialSeries[resultItem]) {
          potentialSeries[resultItem] = {
            label: chartMeta[resultItem].label,
            data: [],
            borderColor: chartMeta[resultItem].colors.borderColor,
            backgroundColor: chartMeta[resultItem].colors.backgroundColor,
            showLine: true
          };
        }

        potentialSeries[resultItem].data.push({
          x: result.request_day,
          y: result[resultItem]
        });
      }
    }

    return Object.values(potentialSeries);
  }, [usageResult]);

  return (
    <div className="col col-12 mx-auto my-5" style={{height: 'auto'}}>
      <Line data={{datasets: chartData}} options={options}/>
    </div>
  )
};

export default ApiUsageChart;
