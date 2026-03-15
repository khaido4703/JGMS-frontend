const ProgressReports = () => {
  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Project Progress Reports</h1>
        <p className="text-gray-500">
          Monitoring student group milestones and sprint completion
        </p>
      </div>

      {/* completion overview */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-sm text-gray-500">Overall Completion</h2>
          <p className="text-4xl font-bold text-green-600">78.4%</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 col-span-2">
          <h2 className="font-semibold mb-4">Class Sprint Burn-up</h2>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>

      </div>

      {/* group progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Group Progress Status
        </h2>

        <div className="grid grid-cols-4 gap-4">

          <div className="bg-white p-4 shadow rounded-xl">
            <h3 className="font-semibold">G1 - E-Commerce App</h3>
            <p className="text-green-600 text-lg font-bold">92%</p>
          </div>

          <div className="bg-white p-4 shadow rounded-xl">
            <h3 className="font-semibold">G2 - LMS Portal</h3>
            <p className="text-yellow-500 text-lg font-bold">45%</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProgressReports;