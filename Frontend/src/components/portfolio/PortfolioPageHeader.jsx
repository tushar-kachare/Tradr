import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortfolioPageHeader = ({ username, portfolioName }) => {
  console.log(username);
  
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0f0f0f]/95 px-4 py-4 backdrop-blur">
      <div className="grid grid-cols-[40px_1fr_40px] items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center">
          <p className="text-base font-semibold text-white">
            {username ? `@${username}` : "Portfolio"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {portfolioName || "Portfolio"}
          </p>
        </div>

        <div />
      </div>
    </div>
  );
};

export default PortfolioPageHeader;
