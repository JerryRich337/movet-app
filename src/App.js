import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import 'antd/dist/reset.css';
import Navbar from "./atoms/navbar/Navbar";
import { ConfigProvider, Layout } from 'antd';
import Athlete from "./Athlete";
import Dashboard from "./Dashboard";


const App = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  var [patientIndex, setPatientIndex] = useState(0);

    return (
      <ConfigProvider
        theme={{
          token: {
                "colorPrimary": "#904199",
                "colorBorderSecondary": "#f0f0f0",
                "borderRadius": 8,
                "colorInfo": "#904199",
                "colorSuccess": "#52c41a",
                "colorWarning": "#fbaf5d",
                "colorError": "#f37f89",
                "fontSizeHeading4": 18,
                "fontSizeHeading5": 14,
              }
        }}
      >
        
      <Layout className="App">
        <Navbar/>
        <Router>
        <Routes>
          <Route path="/" element={<Dashboard setIndex={setPatientIndex} />} />
          <Route path="/athlete" element={<Athlete index={patientIndex}/>} />
          <Route path="/patient" element={<Athlete index={patientIndex}/>} />
        </Routes> 
      </Router>
      </Layout>
    </ConfigProvider>
      
    );

}

export default App;
