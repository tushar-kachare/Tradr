const PortfolioTradeTabs = ({ activeTab, setActiveTab, openCount, closedCount }) => {
  const tabs = [
    { key: "open", label: "Open", count: openCount },
    { key: "closed", label: "Closed", count: closedCount },
  ];

  return (
    <div className="relative mt-6 border-b border-gray-800 px-4">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="relative flex-1 py-3 text-sm font-medium"
          >
            <span
              className={`transition ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label} {tab.count}
            </span>

            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioTradeTabs;
