import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaBell,
  FaUserCircle,
  FaBook,
  FaAward,
  FaUsers,
  FaSignOutAlt,
  FaSitemap,
  FaRegChartBar,
  FaChartPie,
} from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import "./Sidebar.css";

const Dashboard = () => {
  const location = useLocation();
  const activeItem = location.pathname;
  const { t } = useTranslation(["sidebar", "common"]);
  const darkMode = localStorage.getItem("darkMode") === "true";

  const getIconClass = () => "sidebar-icon";

  return (
    <div className="app-container">
      <div className="sidebar">
        {/* <div className="sidebar-header">DashStack</div> */}
        <div className="sidebar-divider">
          <p className="sidebar-a">{t("statistic")}</p>
          <nav className="sidebar-nav">
            {/* <Link to="/dashboard-nhap" className={`sidebar-item ${activeItem === '/dashboard-nhap' ? 'active' : ''}`}>
                            <FaTachometerAlt className={getIconClass('/dashboard-nhap')} />
                            Thong Ke - nhap
                        </Link> */}
            <Link
              to="/dashboard"
              className={`sidebar-item ${
                activeItem === "/dashboard" ? "active" : ""
              }`}
            >
              <FaChartPie className={getIconClass("/dashboard")} />
              {t("dashboard")}
            </Link>
            <Link
              to="/exercise_statistic"
              className={`sidebar-item ${
                activeItem === "/exercise_statistic" ? "active" : ""
              }`}
            >
              <FaRegChartBar className={getIconClass("/exercise_statistic")} />
              {t("exercise_statistic")}
            </Link>
            <Link
              to="/rankingtest"
              className={`sidebar-item ${
                activeItem === "/rankingtest" ? "active" : ""
              }`}
            >
              <FaRankingStar className={getIconClass("/rankingtest")} />
              {t("testSystem")}
            </Link>
            {/* <Link to="/completetask" className={`sidebar-item ${activeItem === '/completetask' ? 'active' : ''}`}>
                            <FaCheckCircle className={getIconClass('/completetask')} />
                            {t('completetask')}
                        </Link> */}

            <div className="sidebar-divider"></div>
            <p className="sidebar-a">{t("management")}</p>
            {/* <Link
              to="/completelesson"
              className={`sidebar-item ${
                activeItem === "/completelesson" ? "active" : ""
              }`}
            >
              <FaCheckCircle className={getIconClass("/completelesson")} />
              {t("completelesson")}
            </Link> */}
            <Link
              to="/notification"
              className={`sidebar-item ${
                activeItem === "/notification" ? "active" : ""
              }`}
            >
              <FaBell className={getIconClass("/notification")} />
              {t("notification")}
            </Link>
            <Link
              to="/account-user"
              className={`sidebar-item ${
                activeItem === "/account-user" ? "active" : ""
              }`}
            >
              <FaUser className={getIconClass("/account-user")} />
              {t("accountUser")}
            </Link>
            <Link
              to="/pupil"
              className={`sidebar-item ${
                activeItem === "/pupil" ? "active" : ""
              }`}
            >
              <FaUsers className={getIconClass("/pupil")} />
              {t("pupil")}
            </Link>
            <Link
              to="/level"
              className={`sidebar-item ${
                activeItem === "/level" ? "active" : ""
              }`}
            >
              <FaSitemap className={getIconClass("/level")} />
              {t("level")}
            </Link>
            <Link
              to="/lesson"
              className={`sidebar-item ${
                activeItem === "/lesson" ? "active" : ""
              }`}
            >
              <FaBook className={getIconClass("/lesson")} />
              {t("lesson")}
            </Link>
            {/* <Link
              to="/systemtask"
              className={`sidebar-item ${
                activeItem === "/systemtask" ? "active" : ""
              }`}
            >
              <FaTasks className={getIconClass("/systemtask")} />
              {t("systemTasks")}
            </Link> */}
            <Link
              to="/rewards"
              className={`sidebar-item ${
                activeItem === "/rewards" ? "active" : ""
              }`}
            >
              <FaAward className={getIconClass("/rewards")} />
              {t("reward")}
            </Link>
            <div className="sidebar-divider"></div>
            <p className="sidebar-a">{t("setting")}</p>
            {/* <Link
              to="/setting"
              className={`sidebar-item ${
                activeItem === "/setting" ? "active" : ""
              }`}
            >
              <FaCog className={getIconClass("/setting")} />
              {t("setting")}
            </Link> */}
            <Link
              to="/profile"
              className={`sidebar-item ${
                activeItem === "/profile" ? "active" : ""
              }`}
            >
              <FaUserCircle className={getIconClass("/profile")} />
              {t("profile")}
            </Link>
            <Link
              to="/logout"
              className={`sidebar-item ${
                activeItem === "/logout" ? "active" : ""
              }`}
            >
              <FaSignOutAlt className={getIconClass("/logout")} />
              {t("logout")}
            </Link>
          </nav>
        </div>
      </div>
      {/* <div className="content">
                <Outlet />
            </div> */}
    </div>
  );
};

export default Dashboard;
