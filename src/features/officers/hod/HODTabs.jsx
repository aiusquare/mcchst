import React from "react";
import HODReports from "./HODReports";

// HOD clearance now lives on its own menu route; this wrapper keeps reports only.
const HODTabs = () => {
  return (
    <div className="container my-4">
      <HODReports />
    </div>
  );
};

export default HODTabs;
