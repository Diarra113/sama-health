import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AssistantIA from "./AssistantIA";
import "./Layout.css";

function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div key={location.pathname} className="page-transition">
        <Outlet />
      </div>
      <Footer />
      <AssistantIA />
    </>
  );
}

export default Layout;