
// helper: compute numeric average of an array, ignoring null/undefined
function avg(arr) {
  const nums = (arr || []).filter(n => n !== null && n !== undefined && !Number.isNaN(n));
  if (nums.length === 0) return 0;
  const sum = nums.reduce((s, v) => s + v, 0);
  return +(sum / nums.length).toFixed(1);
}

// compute percent change between first and last numeric values in an array
function pctChange(arr) {
  const nums = (arr || []).filter(n => n !== null && n !== undefined && !Number.isNaN(n));
  if (nums.length === 0) return 0;
  const first = nums[0];
  const last = nums[nums.length - 1];
  if (first === 0) {
    if (last === 0) return 0;
    return Math.sign(last) * 100;
  }
  return Number((((last - first) / first) * 100).toFixed(0));
}

// choose arrow icon based on percent change: positive -> up, negative -> down, zero -> mid
function arrowFor(arr) {
  const p = pctChange(arr);
  if ( p > 0) {
    if (p > 6) {
      return 'up';
    } else {
      return 'mid';
    }
  }

  if ( p < 0) {
    if (p > -6) {
      return 'mid';
    } else {
      return 'down'
    }
  }
}

const athleteData = [
{
    key: 0,
    name: 'Williams, Ben',
    age: 25,
    dob: "12/01/2000",
    phone: "(289) 233-4977",
    metricData: [
      {
        metric: 'Step Count',
        data: [1000, 1201, 1451, 1004, 1600, 1900, 4812],
        avg: avg([1000, 1201, 1451, 1004, 1600, 1900, 4812]),
        percentage: pctChange([1000, 1201, 1451, 1004, 1600, 1900, 4812]),
        arrow: arrowFor([1000, 1201, 1451, 1004, 1600, 1900, 4812])
      },
      {
        metric: 'Heart Rate',
        data: [112, 98, 85, 100, 71, 90, 85],
        avg: avg([112, 98, 85, 100, 71, 90, 85]),
        percentage: pctChange([112, 98, 85, 100, 71, 90, 85]),
        arrow: arrowFor([112, 98, 85, 100, 71, 90, 85])
      },
      {
        metric: 'Hrs of Rest',
        data: [5, 6, 7, 7, 7, 7, 8],
        avg: avg([5, 6, 7, 7, 7, 7, 8]),
        percentage: pctChange([5, 6, 7, 7, 7, 7, 8]),
        arrow: arrowFor([5, 6, 7, 7, 7, 7, 8])
      }
    ],
    pfTags: ['poor'], // should just be one
    pfScore: [34, 31, 29, 27, 22, 21, 20], // array
    piTags: ['moderate'], // should just be one
    piScore: [68, 72, 76, 75, 70, 67, 60], // array
    dotColor: '#52c41a',
    currentWeek: 3,
  },
  {
    key: 1,
    name: 'Miles, Ken',
    age: 59,
    dob: "08/22/1963",
    phone: "(412) 878-9988",
    metricData: [
        {
            metric: "Step Count",
            data: [435, 1500, 2000, 2121, 1800], // by week for weeks 1-12
          avg: avg([435, 1500, 2000, 2121, 1800]),
            percentage: pctChange([435, 1500, 2000, 2121, 1800]),
            arrow: arrowFor([435, 1500, 2000, 2121, 1800])
        },
        {
            metric: "Heart Rate",
            data: [80, 80, 78, 78, 76], // by week for weeks 1-12
          avg: avg([80, 80, 78, 78, 76]),
            percentage: pctChange([80, 80, 78, 78, 76]),
            arrow: arrowFor([80, 80, 78, 78, 76])
        },
        {
            metric: "Hrs of Rest",
            data: [5.6, 6.5, 6.7, 6.9, 6.1], // by week for weeks 1-12
          avg: avg([5.6, 6.5, 6.7, 6.9, 6.1]),
            percentage: pctChange([5.6, 6.5, 6.7, 6.9, 6.1]),
            arrow: arrowFor([5.6, 6.5, 6.7, 6.9, 6.1])
        }
    ],
    pfTags: ['poor'], // should just be one
    pfScore: [31, 28, 32, 36, 40], // array
    piTags: ['moderate'], // should just be one
    piScore: [72, 72, 68, 64, 62], // array
    dotColor: '#fbaf5d',
    currentWeek: 5,
},
{
    key: 2,
    name: "Perez, Sergio",
    age: 62,
    dob: "02/14/1959",
    phone: "(717) 724-3344",
    metricData: [
        {
        metric: "Step Count",
        data: [1340, 1533, 1639, 2729, 2500, 2789, 3493],
        avg: avg([1340, 1533, 1639, 2729, 2500, 2789, 3493]),
        percentage: pctChange([1340, 1533, 1639, 2729, 2500, 2789, 3493]),
        arrow: arrowFor([1340, 1533, 1639, 2729, 2500, 2789, 3493])
      },
      {
        metric: "Heart Rate",
        data: [80, 79, 76, 78, 79, 91, 90],
        avg: avg([80, 79, 76, 78, 79, 91, 90]),
        percentage: pctChange([80, 79, 76, 78, 79, 91, 90]),
        arrow: arrowFor([80, 79, 76, 78, 79, 91, 90])
      },
      {
        metric: "Hrs of Rest",
        data: [4.3, 4.5, 4.6, 4.7, 6.4, 7.2, 6.8],
        avg: avg([4.3, 4.5, 4.6, 4.7, 6.4, 7.2, 6.8]),
        percentage: pctChange([4.3, 4.5, 4.6, 4.7, 6.4, 7.2, 6.8]),
        arrow: arrowFor([4.3, 4.5, 4.6, 4.7, 6.4, 7.2, 6.8])
      }
    ],
    pfTags: ["moderate"],
    pfScore: [22, 29, 31, 37, 39, 42, 43],
    piTags: ["good"],
    piScore: [75, 72, 69, 67, 63, 60, 58],
    dotColor: "#fbaf5d",
    currentWeek: 7
  },
  {
    key: 3,
    name: 'Johnson, Mike',
    age: 71,
    dob: "10/30/1954",
    phone: "(289)-438-7764",
    metricData: [
    {
        metric: "Step Count",
        data: [533, 1243, 1530, 2305, 2623, 3000, 3135, 3100, 3222, 3253, 3135, 3253, 3120, 2403], // by week for weeks 1-7
        avg: avg([533, 1243, 1530, 2305, 2623, 3000, 3135, 3100, 3222, 3253, 3135, 3253, 3120, 2403]),
        percentage: pctChange([533, 1243, 1530, 2305, 2623, 3000, 3135, 3100, 3222, 3253, 3135, 3253, 3120, 2403]),
        arrow: arrowFor([533, 1243, 1530, 2305, 2623, 3000, 3135, 3100, 3222, 3253, 3135, 3253, 3120, 2403])
    },
    {
        metric: "Heart Rate",
        data: [80, 90, 88, 85, 82, 79, 75, 72, 76, 78, 85, 85, 85, 97], // by week for weeks 1-7
        avg: avg([80, 90, 88, 85, 82, 79, 75, 72, 76, 78, 85, 85, 85, 97]),
        percentage: pctChange([80, 90, 88, 85, 82, 79, 75, 72, 76, 78, 85, 85, 85, 97]),
        arrow: arrowFor([80, 90, 88, 85, 82, 79, 75, 72, 76, 78, 85, 85, 85, 97])
    },
    {
      metric: "Hrs of Rest",
        data: [5, 5, 5, 5, 5.5, 6, 6.5, 6.7, 6.5, 6.9, 7.2, 7, 7, 7.5], // by week for weeks 1-7
        avg: avg([5, 5, 5, 5, 5.5, 6, 6.5, 6.7, 6.5, 6.9, 7.2, 7, 7, 7.5]),
        percentage: pctChange([5, 5, 5, 5, 5.5, 6, 6.5, 6.7, 6.5, 6.9, 7.2, 7, 7, 7.5]),
        arrow: arrowFor([5, 5, 5, 5, 5.5, 6, 6.5, 6.7, 6.5, 6.9, 7.2, 7, 7, 7.5])
    }
    ],
     pfTags: ["moderate"],
        pfScore: [34, 36, 37, 39, 42, 42, 43, 46, 44, 46, 47, 49, 34, 32],
        piTags: ["moderate"],
        piScore: [76, 72, 70, 68, 65, 64, 67, 64, 62, 61, 60, 58, 75, 78],
        dotColor: "#f37f89",
        currentWeek: 10
},
{
    key: 4,
    name: 'Davis, Jim',
    age: 69,
    dob: "07/11/1952",
    phone: "(724) 878-7788",
    metricData: [
    {
        metric: "Step Count",
        data: [340, 533, 639, null, 894, 2789, 3493, null, 3784, 3678, 3890, 4000, 3786],
        avg: avg([340, 533, 639, null, 894, 2789, 3493, null, 3784, 3678, 3890, 4000, 3786]),
        percentage: pctChange([340, 533, 639, null, 894, 2789, 3493, null, 3784, 3678, 3890, 4000, 3786]),
        arrow: arrowFor([340, 533, 639, null, 894, 2789, 3493, null, 3784, 3678, 3890, 4000, 3786])
    },
    {
        metric: "Heart Rate",
        data: [80, 82, 86, null, 86, 84, 85, null, 82, 86, 88, 90, 91],
        avg: avg([80, 82, 86, null, 86, 84, 85, null, 82, 86, 88, 90, 91]),
        percentage: pctChange([80, 82, 86, null, 86, 84, 85, null, 82, 86, 88, 90, 91]),
        arrow: arrowFor([80, 82, 86, null, 86, 84, 85, null, 82, 86, 88, 90, 91])
    },
    {
      metric: "Hrs of Rest",
        data: [6.4, 6.7, 6.8, null, 6.4, 7.2, 6.8, null, 7.4, 6.9, 7.2, 9.0, 8.1],
        avg: avg([6.4, 6.7, 6.8, null, 6.4, 7.2, 6.8, null, 7.4, 6.9, 7.2, 9.0, 8.1]),
        percentage: pctChange([6.4, 6.7, 6.8, null, 6.4, 7.2, 6.8, null, 7.4, 6.9, 7.2, 9.0, 8.1]),
        arrow: arrowFor([6.4, 6.7, 6.8, null, 6.4, 7.2, 6.8, null, 7.4, 6.9, 7.2, 9.0, 8.1])
    }
    ],
     pfTags: ["moderate"],
        pfScore: [22, 29, 31, null, 39, 42, 43, null, 46, 48, 53, 56, 56],
        piTags: ["good"],
        piScore: [75, 72, 69, null, 63, 60, 58, null, 55, 50, 45, 40, 40],
          dotColor: "#52c41a",
          currentWeek: 5
  },


]

export default athleteData;