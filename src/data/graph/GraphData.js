import athleteData from '../athleteData';

// idea for aggregate, make it the last index for each data and then add that to the series on Athlete.js

// mapping: Week -3 -> Event 1, Week -2 -> Event 2, ..., Week 10 -> Event 14
const allWeeks = [
    "Event 1",
    "Event 2",
    "Event 3",
    "Event 4",
    "Event 5",
    "Event 6",
    "Event 7",
    "Event 8",
    "Event 9",
    "Event 10",
    "Event 11",
    "Event 12",
    "Event 13",
    "Event 14",
]

const athleteFitbitGraphOptions = {
    chart: {
        height: 350,
        type: 'column',
        stacked: false,
    },
    colors: ["#E53935", "#acacac"],
    plotOptions: {
        bar: {
            columnWidth: '30%'
        }
    },
    stroke: {
        width: [0, 2, 5],
        curve: 'smooth'
     },
    xaxis: {
        categories: allWeeks
    },
    markers: {
        size: 4
    },
    fill: {
        opacity: [0.85, 0.25, 1],
    },
    tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0);
            }
            return y;
      
          }
        }
      },
    dataLabels: {
        enabled: false,
        enabledOnSeries: [1]
    },
}

const stepCountData = [
    {
        name: athleteData[0].name,
        data: athleteData[0].metricData[0].data
    },
    {
        name: athleteData[1].name,
        data: athleteData[1].metricData[0].data
    },
    {
        name: athleteData[2].name,
        data: athleteData[2].metricData[0].data
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].metricData[0].data
    },
    {
        name: athleteData[4].name,
        data: athleteData[4].metricData[0].data
    },
    // {
    //     name: patientData[5].name,
    //     data: patientData[5].metricData[0].data
    // },
    // {
    //     name: patientData[6].name,
    //     data: patientData[6].metricData[0].data
    // },
    // {
    //     name: patientData[7].name,
    //     data: patientData[7].metricData[0].data
    // },
    // {
    //     name: patientData[8].name,
    //     data: patientData[8].metricData[0].data
    // },
    // {
    //     name: patientData[9].name,
    //     data: patientData[9].metricData[0].data
    // },
    // {
    //     name: patientData[10].name,
    //     data: patientData[10].metricData[0].data
    // },
    // {
    //     name: patientData[11].name,
    //     data: patientData[11].metricData[0].data
    // },
    // {
    //     name: patientData[12].name,
    //     data: patientData[12].metricData[0].data
    // },
    // {
    //     name: patientData[13].name,
    //     data: patientData[13].metricData[0].data
    // },
    // {
    //     name: patientData[14].name,
    //     data: patientData[14].metricData[0].data
    // },
    // {
    //     name: patientData[15].name,
    //     data: patientData[15].metricData[0].data
    // },
    // {
    //     name: patientData[16].name,
    //     data: patientData[16].metricData[0].data
    // },
    // {
    //     name: patientData[17].name,
    //     data: patientData[17].metricData[0].data
    // },
    // {
    //     name: patientData[18].name,
    //     data: patientData[18].metricData[0].data
    // },
    // {
    //     name: patientData[19].name,
    //     data: patientData[19].metricData[0].data
    // },
]

const heartRateData = [
    {
        name: athleteData[0].name,
        data: athleteData[0].metricData[1].data
    },
    {
        name: athleteData[1].name,
        data: athleteData[1].metricData[1].data
    },
    {
        name: athleteData[2].name,
        data: athleteData[2].metricData[1].data
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].metricData[1].data
    },
    {
        name: athleteData[4].name,
        data: athleteData[4].metricData[1].data
    },
    // {
    //     name: athleteData[5].name,
    //     data: patientData[5].metricData[1].data
    // },
    // {
    //     name: patientData[6].name,
    //     data: patientData[6].metricData[1].data
    // },
    // {
    //     name: patientData[7].name,
    //     data: patientData[7].metricData[1].data
    // },
    // {
    //     name: patientData[8].name,
    //     data: patientData[8].metricData[1].data
    // },
    // {
    //     name: patientData[9].name,
    //     data: patientData[9].metricData[1].data
    // },
    // {
    //     name: patientData[10].name,
    //     data: patientData[10].metricData[1].data
    // },
    // {
    //     name: patientData[11].name,
    //     data: patientData[11].metricData[1].data
    // },
    // {
    //     name: patientData[12].name,
    //     data: patientData[12].metricData[1].data
    // },
    // {
    //     name: patientData[13].name,
    //     data: patientData[13].metricData[1].data
    // },
    // {
    //     name: patientData[14].name,
    //     data: patientData[14].metricData[1].data
    // },
    // {
    //     name: patientData[15].name,
    //     data: patientData[15].metricData[1].data
    // },
    // {
    //     name: patientData[16].name,
    //     data: patientData[16].metricData[1].data
    // },
    // {
    //     name: patientData[17].name,
    //     data: patientData[17].metricData[1].data
    // },
    // {
    //     name: patientData[18].name,
    //     data: patientData[18].metricData[1].data
    // },
    // {
    //     name: patientData[19].name,
    //     data: patientData[19].metricData[1].data
    // },
]

const hrsOfSleepData = [
    {
        name: athleteData[0].name,
        data: athleteData[0].metricData[2].data
    },
    {
        name: athleteData[1].name,
        data: athleteData[1].metricData[2].data
    },
    {
        name: athleteData[2].name,
        data: athleteData[2].metricData[2].data
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].metricData[2].data
    },
    {
        name: athleteData[4].name,
        data: athleteData[4].metricData[2].data
    },
    // {
    //     name: patientData[5].name,
    //     data: patientData[5].metricData[2].data
    // },
    // {
    //     name: patientData[6].name,
    //     data: patientData[6].metricData[2].data
    // },
    // {
    //     name: patientData[7].name,
    //     data: patientData[7].metricData[2].data
    // },
    // {
    //     name: patientData[8].name,
    //     data: patientData[8].metricData[2].data
    // },
    // {
    //     name: patientData[9].name,
    //     data: patientData[9].metricData[2].data
    // },
    // {
    //     name: patientData[10].name,
    //     data: patientData[10].metricData[2].data
    // },
    // {
    //     name: patientData[11].name,
    //     data: patientData[11].metricData[2].data
    // },
    // {
    //     name: patientData[12].name,
    //     data: patientData[12].metricData[2].data
    // },
    // {
    //     name: patientData[13].name,
    //     data: patientData[13].metricData[2].data
    // },
    // {
    //     name: patientData[14].name,
    //     data: patientData[14].metricData[2].data
    // },
    // {
    //     name: patientData[15].name,
    //     data: patientData[15].metricData[2].data
    // },
    // {
    //     name: patientData[16].name,
    //     data: patientData[16].metricData[2].data
    // },
    // {
    //     name: patientData[17].name,
    //     data: patientData[17].metricData[2].data
    // },
    // {
    //     name: patientData[18].name,
    //     data: patientData[18].metricData[2].data
    // },
    // {
    //     name: patientData[19].name,
    //     data: patientData[19].metricData[2].data
    // },
]

const physicalFuncData = [
    {
        name: athleteData[0].name,
        data: athleteData[0].pfScore
    },
    {
        name: athleteData[1].name,
        data: athleteData[1].pfScore
    },
    {
        name: athleteData[2].name,
        data: athleteData[2].pfScore
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].pfScore
    },
    {
        name: athleteData[4].name,
        data: athleteData[4].pfScore
    }
]

const painInterData = [
    {
        name: athleteData[0].name,
        data: athleteData[0].piScore
    },
    {
        name: athleteData[1].name,
        data: athleteData[1].piScore
    },
    {
        name: athleteData[2].name,
        data: athleteData[2].piScore
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].piScore
    },
    {
        name: athleteData[3].name,
        data: athleteData[3].piScore
    }
]

export {
    stepCountData,
    heartRateData,
    hrsOfSleepData,
    physicalFuncData,
    painInterData,
    athleteFitbitGraphOptions
}