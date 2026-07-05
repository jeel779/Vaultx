import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
        <ShieldAlert className="w-24 h-24 text-blue-500 relative z-10 animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-3">
        404 - Page Not Found
      </h1>
      
      <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        The page you are looking for doesn't exist or has been moved. Let's get you back to the marketplace.
      </p>
      
      <Link
        to="/"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
