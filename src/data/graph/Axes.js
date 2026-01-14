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

const stepCountAll = {
    chart: {
      id: "Step Count"
    },
    stroke: {
      // per-series widths: keep most lines standard, make Davis (index 4) thinner
      width: [2, 2, 2, 2, 1],
      curve: 'smooth'
    },
    xaxis: {
      categories: allWeeks
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#ffffff',
      hover: { size: 6 }
    },
    tooltip: {
      marker: { show: true }
    },
    // colors: ["#fbaf5d", "#fbaf5d", "#52c41a", "#f37f89", "#52c41a"],
  }

const stepCountAnnotated = {
  chart: {
    id: "Step Count"
  },
  xaxis: {
    categories: allWeeks
  },
  
}

// const stepCount1 = {
//     chart: {
//       id: "Step Count"
//     },
//     xaxis: {
//       categories: allWeeks.slice(0, 3)
//     }
//   }
// const stepCount2 = {
//     chart: {
//       id: "Step Count"
//     },
//     xaxis: {
//       categories: allWeeks.slice(3, 6)
//     }
//   }
// const stepCount3 = {
//     chart: {
//       id: "Step Count"
//     },
//     xaxis: {
//       categories: allWeeks.slice(6, 9)
//     }
//   }
// const stepCount4 = {
//     chart: {
//       id: "Step Count"
//     },
//     xaxis: {
//       categories: allWeeks.slice(9, 12)
//     }
//   }

  const heartRateAll = {
    chart: {
      id: "Heart Rate"
    },
    stroke: {
      // per-series widths: make Davis (index 4) thinner
      width: [2, 2, 2, 2, 1],
      curve: 'smooth'
    },
    xaxis: {
      categories: allWeeks
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#ffffff',
      hover: { size: 6 }
    },
    tooltip: {
      marker: { show: true }
    },
    // colors: ["#fbaf5d", "#fbaf5d", "#52c41a", "#f37f89", "#52c41a"],
  }

  const heartRateAnnotated = {
    chart: {
      id: "Heart Rate"
    },
    xaxis: {
      categories: allWeeks
    },
    
  }

  // const heartRate1 = {
  //   chart: {
  //     id: "Heart Rate"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(0, 3)
  //   }
  // }

  // const heartRate2 = {
  //   chart: {
  //     id: "Heart Rate"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(3, 6)
  //   }
  // }

  // const heartRate3 = {
  //   chart: {
  //     id: "Heart Rate"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(6, 9)
  //   }
  // }

  // const heartRate4 = {
  //   chart: {
  //     id: "Heart Rate"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(9, 12)
  //   }
  // }

const hrsOfSleepAll = {
    chart: {
      id: "Hrs of Rest"
    },
    stroke: {
      // per-series widths: make Davis (index 4) thinner
      width: [2, 2, 2, 2, 1],
      curve: 'smooth'
    },
    xaxis: {
      categories: allWeeks
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#ffffff',
      hover: { size: 6 }
    },
    tooltip: {
      marker: { show: true }
    },
    // colors: ["#fbaf5d", "#fbaf5d", "#52c41a", "#f37f89", "#52c41a"],
  }

  const hrsOfSleepAnnotated = {
    chart: {
      id: "Hrs of Rest"
    },
    xaxis: {
      categories: allWeeks
    },
    
  }

  // const hrsOfSleep1 = {
  //   chart: {
  //     id: "Hrs of Sleep"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(0, 3)
  //   }
  // }

  // const hrsOfSleep2 = {
  //   chart: {
  //     id: "Hrs of Sleep"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(3, 6)
  //   }
  // }

  // const hrsOfSleep3 = {
  //   chart: {
  //     id: "Hrs of Sleep"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(6, 9)
  //   }
  // }

  // const hrsOfSleep4 = {
  //   chart: {
  //     id: "Hrs of Sleep"
  //   },
  //   xaxis: {
  //     categories: allWeeks.slice(9, 12)
  //   }
  // }

  const physicalFuncAnnotated = {
    chart: {
      id: "Activeness"
    },
    xaxis: {
      categories: allWeeks
    },
    
  }

  const painInterAnnotated = {
    chart: {
      id: "Pain"
    },
    xaxis: {
      categories: allWeeks
    },
    
  }

  export {
    stepCountAll,
    stepCountAnnotated,
    // stepCount1,
    // stepCount2,
    // stepCount3,
    // stepCount4,
    heartRateAll,
    heartRateAnnotated,
    // heartRate1,
    // heartRate2,
    // heartRate3,
    // heartRate4,
    hrsOfSleepAll,
    hrsOfSleepAnnotated,
    // hrsOfSleep1,
    // hrsOfSleep2,
    // hrsOfSleep3,
    // hrsOfSleep4
    physicalFuncAnnotated,
    painInterAnnotated
}