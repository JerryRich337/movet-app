import patientData from '../PatientData';


const tableData = [
    {
      key: patientData[0].key,
      name: patientData[0].name,
      age: patientData[0].age,
      stepCount: patientData[0].metricData[0].avg,
      heartRate: patientData[0].metricData[1].avg,
      hrsOfSleep: patientData[0].metricData[2].avg,
      pfTags: patientData[0].pfTags,
      piTags: patientData[0].piTags
    },
    {
      key: patientData[1].key,
      name: patientData[1].name,
      age: patientData[1].age,
      stepCount: patientData[1].metricData[0].avg,
      heartRate: patientData[1].metricData[1].avg,
      hrsOfSleep: patientData[1].metricData[2].avg,
      pfTags: patientData[1].pfTags,
      piTags: patientData[1].piTags
    },
    {
      key: patientData[2].key,
      name: patientData[2].name,
      age: patientData[2].age,
      stepCount: patientData[2].metricData[0].avg,
      heartRate: patientData[2].metricData[1].avg,
      hrsOfSleep: patientData[2].metricData[2].avg,
      pfTags: patientData[2].pfTags,
      piTags: patientData[2].piTags
    },
    {
      key: patientData[3].key,
      name: patientData[3].name,
      age: patientData[3].age,
      stepCount: patientData[3].metricData[0].avg,
      heartRate: patientData[3].metricData[1].avg,
      hrsOfSleep: patientData[3].metricData[2].avg,
      pfTags: patientData[3].pfTags,
      piTags: patientData[3].piTags
    },
    {
      key: patientData[4].key,
      name: patientData[4].name,
      age: patientData[4].age,
      stepCount: patientData[4].metricData[0].avg,
      heartRate: patientData[4].metricData[1].avg,
      hrsOfSleep: patientData[4].metricData[2].avg,
      pfTags: patientData[4].pfTags,
      piTags: patientData[4].piTags
    },
    // {
    //   key: patientData[5].key,
    //   name: patientData[5].name,
    //   age: patientData[5].age,
    //   stepCount: patientData[5].metricData[0].avg,
    //   heartRate: patientData[5].metricData[1].avg,
    //   hrsOfSleep: patientData[5].metricData[2].avg,
    //   pfTags: patientData[5].pfTags,
    //   piTags: patientData[5].piTags
    // },
    // {
    //   key: patientData[6].key,
    //   name: patientData[6].name,
    //   age: patientData[6].age,
    //   stepCount: patientData[6].metricData[0].avg,
    //   heartRate: patientData[6].metricData[1].avg,
    //   hrsOfSleep: patientData[6].metricData[2].avg,
    //   pfTags: patientData[6].pfTags,
    //   piTags: patientData[6].piTags
    // },
    // {
    //   key: patientData[7].key,
    //   name: patientData[7].name,
    //   age: patientData[7].age,
    //   stepCount: patientData[7].metricData[0].avg,
    //   heartRate: patientData[7].metricData[1].avg,
    //   hrsOfSleep: patientData[7].metricData[2].avg,
    //   pfTags: patientData[7].pfTags,
    //   piTags: patientData[7].piTags
    // },
    // {
    //   key: patientData[8].key,
    //   name: patientData[8].name,
    //   age: patientData[8].age,
    //   stepCount: patientData[8].metricData[0].avg,
    //   heartRate: patientData[8].metricData[1].avg,
    //   hrsOfSleep: patientData[8].metricData[2].avg,
    //   pfTags: patientData[8].pfTags,
    //   piTags: patientData[8].piTags
    // },
    // {
    //   key: patientData[9].key,
    //   name: patientData[9].name,
    //   age: patientData[9].age,
    //   stepCount: patientData[9].metricData[0].avg,
    //   heartRate: patientData[9].metricData[1].avg,
    //   hrsOfSleep: patientData[9].metricData[2].avg,
    //   pfTags: patientData[9].pfTags,
    //   piTags: patientData[9].piTags
    // },
    // {
    //   key: patientData[10].key,
    //   name: patientData[10].name,
    //   age: patientData[10].age,
    //   stepCount: patientData[10].metricData[0].avg,
    //   heartRate: patientData[10].metricData[1].avg,
    //   hrsOfSleep: patientData[10].metricData[2].avg,
    //   pfTags: patientData[10].pfTags,
    //   piTags: patientData[10].piTags
    // },
    // {
    //   key: patientData[11].key,
    //   name: patientData[11].name,
    //   age: patientData[11].age,
    //   stepCount: patientData[11].metricData[0].avg,
    //   heartRate: patientData[11].metricData[1].avg,
    //   hrsOfSleep: patientData[11].metricData[2].avg,
    //   pfTags: patientData[11].pfTags,
    //   piTags: patientData[11].piTags
    // },
    // {
    //   key: patientData[12].key,
    //   name: patientData[12].name,
    //   age: patientData[12].age,
    //   stepCount: patientData[12].metricData[0].avg,
    //   heartRate: patientData[12].metricData[1].avg,
    //   hrsOfSleep: patientData[12].metricData[2].avg,
    //   pfTags: patientData[12].pfTags,
    //   piTags: patientData[12].piTags
    // },
    // {
    //   key: patientData[13].key,
    //   name: patientData[13].name,
    //   age: patientData[13].age,
    //   stepCount: patientData[13].metricData[0].avg,
    //   heartRate: patientData[13].metricData[1].avg,
    //   hrsOfSleep: patientData[13].metricData[2].avg,
    //   pfTags: patientData[13].pfTags,
    //   piTags: patientData[13].piTags
    // },
    // {
    //   key: patientData[14].key,
    //   name: patientData[14].name,
    //   age: patientData[14].age,
    //   stepCount: patientData[14].metricData[0].avg,
    //   heartRate: patientData[14].metricData[1].avg,
    //   hrsOfSleep: patientData[14].metricData[2].avg,
    //   pfTags: patientData[14].pfTags,
    //   piTags: patientData[14].piTags
    // },
    // {
    //   key: patientData[15].key,
    //   name: patientData[15].name,
    //   age: patientData[15].age,
    //   stepCount: patientData[15].metricData[0].avg,
    //   heartRate: patientData[15].metricData[1].avg,
    //   hrsOfSleep: patientData[15].metricData[2].avg,
    //   pfTags: patientData[15].pfTags,
    //   piTags: patientData[15].piTags
    // },
    // {
    //   key: patientData[16].key,
    //   name: patientData[16].name,
    //   age: patientData[16].age,
    //   stepCount: patientData[16].metricData[0].avg,
    //   heartRate: patientData[16].metricData[1].avg,
    //   hrsOfSleep: patientData[16].metricData[2].avg,
    //   pfTags: patientData[16].pfTags,
    //   piTags: patientData[16].piTags
    // },
    // {
    //   key: patientData[17].key,
    //   name: patientData[17].name,
    //   age: patientData[17].age,
    //   stepCount: patientData[17].metricData[0].avg,
    //   heartRate: patientData[17].metricData[1].avg,
    //   hrsOfSleep: patientData[17].metricData[2].avg,
    //   pfTags: patientData[17].pfTags,
    //   piTags: patientData[17].piTags
    // },
    // {
    //   key: patientData[18].key,
    //   name: patientData[18].name,
    //   age: patientData[18].age,
    //   stepCount: patientData[18].metricData[0].avg,
    //   heartRate: patientData[18].metricData[1].avg,
    //   hrsOfSleep: patientData[18].metricData[2].avg,
    //   pfTags: patientData[18].pfTags,
    //   piTags: patientData[18].piTags
    // },
    // {
    //   key: patientData[19].key,
    //   name: patientData[19].name,
    //   age: patientData[19].age,
    //   stepCount: patientData[19].metricData[0].avg,
    //   heartRate: patientData[19].metricData[1].avg,
    //   hrsOfSleep: patientData[19].metricData[2].avg,
    //   pfTags: patientData[19].pfTags,
    //   piTags: patientData[19].piTags
    // },
  ];

  // const data = patientData.map((patient) => {
  //     key: patient.key,
  //     name: patient.name,
  //     age: patient.age,
  //     stepCount: patient.metricData[0].avg,
  //     heartRate: patient.metricData[1].avg,
  //     hrsOfSleep: patient.metricData[2].avg,
  //     pfTags: patient.pfTags,
  //     piTags: patient.piTags
  //   }
  // );


  export default tableData;