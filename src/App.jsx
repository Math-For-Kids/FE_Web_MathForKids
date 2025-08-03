import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./component/MainLayout";
import Siderbar from "./component/Sidebar";
import DashboardPage_Nhap from "./page/Dashboard/dashboard";
import DashboardPage from "./page/Dashboard";
import AccountUserPage from "./page/AccountUser/accountuser";
import RewardPage from "./page/Reward/reward";
import LoginPage from "./page/Login/login";
import ForgotPasswordPage from "./page/ForgotPassword/forgotpassword";
import ResetPasswordPage from "./page/ResetPassword/resetpassword";
import VerifyPage from "./page/verify/verify";
import LessonPage from "./page/Lesson/lesson";
import LessonDetailPage from "./page/LessonDetail/lessondetail";
import ProfilePage from "./page/Profile/profile";
import SettingPage from "./page/Setting/setting";
import TestSystemPage from "./page/TestSystem";
import SystemTaskPage from "./page/SystemTask/systemtask";
import QuestionTestPage from "./page/QuestionTest/questiontest";
import AssessmentPage from "./page/Assessment/assessment";
import NotificationPage from "./page/Notification/notification";
import ExercisePage from "./page/Exercise/exercise";
import LevelPage from "./page/Level/level";
import PupilPage from "./page/Pupil/pupil";
import CompleteTaskPage from "./page/CompleteTask/completetask";
import CompleteLessonPage from "./page/CompleteLesson/completelesson";
import ExerciseStatistic from "./page/ExerciseStatistic";
import Logout from "./page/Logout/logout";
import Auth from "./component/auth";
import { Navigate } from "react-router-dom";
import {
  darkColors,
  injectColorsToRoot,
  lightColors,
} from "./assets/theme/colors";
import { injectFontsToRoot } from "./assets/theme/fonts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/language/i18n";
function App() {
  useEffect(() => {
    // Initialize theme based on localStorage
    const savedMode = localStorage.getItem("darkMode");
    const isDark = savedMode === "dark";
    injectColorsToRoot(isDark ? darkColors : lightColors);
  }, []);

  return (
    <>
      <ToastContainer />
      <ConfigProvider
        theme={{
          token: {
            colorBorder: "var(--color-border)",
            colorBorderSecondary: "var(--color-border-secondary)",
            colorIcon: "var(--color-icon)",
            colorIconHover: "var(--color-icon-hover)",
            colorBgContainer: "var(--color-bg-container)",
            colorBgElevated: "var(--color-bg-elevated)",
            colorText: "var(--color-text)",
            colorTextPlaceholder: "var(--color-text-placeholder)",
            colorTextDescription: "var(--color-text-description)",
            colorTextDisabled: "var(--color-text-disabled)",
            controlItemBgActive: "var(--cell-active-with-range-bg)",
            colorBgContainerDisabled: "var(--cell-bg-disabled)",
            colorTextQuaternary:"var(--color-text-quaternary)",
            colorTextTertiary: "var(--color-text-tertiary)",
            colorErrorOutline: "var(--color-error-outline)",
            colorBgMask: "var(--color-bg-mask)",
          },
          components: {
            Segmented: {
              itemActiveBg: "var(--active-bg)",
              itemColor: "var(--item-color)",
              itemHoverBg: "var(--hover-bg)",
              itemHoverColor: "var(--hover-color)",
              itemSelectedBg: "var(--selected-bg)",
              itemSelectedColor: "var(--selected-color)",
              trackBg: "var(--track-bg)",
            },
            Select: {
              activeBorderColor: "var(--active-border-color)", // Viền khi focus
              activeOutlineColor: "var(--active-outline-color)", // Màu outline khi focus
              clearBg: "var(--clear-bg)", // Nền icon clear
              hoverBorderColor: "var(--hover-border-color)", // Viền khi hover
              optionActiveBg: "var(--option-active-bg)", // Nền khi option được hover
              optionSelectedBg: "var(--option-selected-bg)", // Nền khi option được chọn
              optionSelectedColor: "var(--option-selected-color)", // Màu chữ khi chọn
              selectorBg: "var(--background-form)", // Nền của ô select
            },
            Input: {
              activeBg: "var(--active-datepicker-bg)",
              activeBorderColor: "var(--active-datepicker-border-color)",
              hoverBg: "var(--hover-datepicker-bg)",
              hoverBorderColor: "var(--hover-datepicker-border-color)",
              activeShadow: "var(--active-shadow)",
              errorActiveShadow: "var(--error-text)"
            },
            InputNumber: {
              activeBg: "var(--active-datepicker-bg)",
              activeBorderColor: "var(--active-datepicker-border-color)",
              hoverBg: "var(--date-picker-bg)",
              hoverBorderColor: "var(--hover-datepicker-border-color)",
              activeShadow: "var(--active-shadow)",
              errorActiveShadow: "var(--error-text)"
            },
            Tabs: {
              inkBarColor: "var(--ink-bar-color)",
              itemActiveColor: "var(--item-active-color)",
              itemHoverColor: "var(--item-hover-color)",
              itemSelectedColor: "var(--item-selected-color)",
            },
            DatePicker: {
              activeBg: "var(--active-datepicker-bg)",
              activeBorderColor: "var(--active-datepicker-border-color)",
              addonBg: "var(--addon-bg)",
              cellActiveWithRangeBg: "var(--cell-active-with-range-bg)",
              cellBgDisabled: "var(--cell-bg-disabled)",
              cellHoverBg: "var(--cell-hover-bg)",
              cellHoverWithRangeBg: "var(--cell-hover-with-range-bg)",
              cellRangeBorderColor: "var(--cell-range-border-color)",
              hoverBg: "var(--hover-datepicker-bg)",
              hoverBorderColor: "var(--hover-datepicker-border-color)",
              multipleItemBg: "var(--multiple-item-bg)",
              multipleItemColorDisabled: "var(--multiple-item-color-disabled)",
              activeShadow: "var(--active-shadow)"
            },
            Table: {
              rowHoverBg: "var(--row-hover-bg)",
            },
            Modal: {
              contentBg: "var(--color-bg-container)",
              headerBg: "var(--color-bg-container)",
            },
            Button: {
              defaultBg: "var(--default-bg)",
              defaultHoverBg: "var(--default-bg)",
            },
          },
        }}
      >
        <Router>
          <Routes>
            <Route element={<Auth />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard-nhap" element={<DashboardPage_Nhap />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="account-user" element={<AccountUserPage />} />
                <Route path="rewards" element={<RewardPage />} />
                <Route path="lesson" element={<LessonPage />} />
                <Route
                  path="lessondetail/:lessonId"
                  element={<LessonDetailPage />}
                />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="setting" element={<SettingPage />} />
                <Route path="rankingtest" element={<TestSystemPage />} />
                <Route path="systemtask" element={<SystemTaskPage />} />
                <Route
                  path="questiontest/:testId"
                  element={<QuestionTestPage />}
                />
                <Route path="assessment" element={<AssessmentPage />} />
                <Route path="notification" element={<NotificationPage />} />
                <Route
                  path="/exercise/getByLesson/:lessonId"
                  element={<ExercisePage />}
                />
                <Route path="level" element={<LevelPage />} />
                <Route path="pupil" element={<PupilPage />} />
                <Route path="completetask" element={<CompleteTaskPage />} />
                <Route path="completelesson" element={<CompleteLessonPage />} />
                <Route
                  path="exercise_statistic"
                  element={<ExerciseStatistic />}
                />
                <Route path="logout" element={<Logout />} />
              </Route>
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route path="forgotpassword" element={<ForgotPasswordPage />} />
            <Route path="resetpassword" element={<ResetPasswordPage />} />
            <Route path="verify" element={<VerifyPage />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </>
  );
}

export default App;
injectColorsToRoot(lightColors);
injectFontsToRoot();
