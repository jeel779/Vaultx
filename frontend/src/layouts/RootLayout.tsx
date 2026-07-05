import type { ReactNode } from "react";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-[#f3f4f6]">
      {/* Dynamic light effects in background for premium SaaS look */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
