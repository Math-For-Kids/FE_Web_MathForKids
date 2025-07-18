import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./component/MainLayout"
import Siderbar from './component/Sidebar';
import DashboardPage_Nhap from './page/Dashboard/dashboard';
import DashboardPage from './page/Dashboard';
import AccountUserPage from './page/AccountUser/accountuser';
import RewardPage from './page/Reward/reward';
import LoginPage from './page/Login/login';
import ForgotPasswordPage from './page/ForgotPassword/forgotpassword';
import ResetPasswordPage from './page/ResetPassword/resetpassword';
import VerifyPage from './page/verify/verify';
import LessonPage from './page/Lesson/lesson';
import LessonDetailPage from './page/LessonDetail/lessondetail';
import ProfilePage from './page/Profile/profile';
import SettingPage from './page/Setting/setting';
import TestSystemPage from './page/TestSystem/testsystem';
import SystemTaskPage from './page/SystemTask/systemtask';
import QuestionTestPage from './page/QuestionTest/questiontest';
import AssessmentPage from './page/Assessment/assessment';
import NotificationPage from './page/Notification/notification';
import ExercisePage from './page/Exercise/exercise';
import LevelPage from './page/Level/level';
import PupilPage from './page/Pupil/pupil';
import CompleteTaskPage from './page/CompleteTask/completetask';
import CompleteLessonPage from './page/CompleteLesson/completelesson';
import ExerciseStatistic from './page/ExerciseStatistic';
import Logout from './page/Logout/logout';
import Auth from './component/auth';
import { Navigate } from 'react-router-dom';
import { darkColors, injectColorsToRoot, lightColors } from './assets/theme/colors';
import { injectFontsToRoot } from './assets/theme/fonts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/language/i18n';
function App() {
  useEffect(() => {
    // Initialize theme based on localStorage
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode ? JSON.parse(savedMode) : false;
    injectColorsToRoot(isDark ? darkColors : lightColors);
  }, []);

  return (
    <>
      <ToastContainer />
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
              <Route path="lessondetail/:lessonId" element={<LessonDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="setting" element={<SettingPage />} />
              <Route path="testsystem" element={<TestSystemPage />} />
              <Route path="systemtask" element={<SystemTaskPage />} />
              <Route path="questiontest/:testId" element={<QuestionTestPage />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="notification" element={<NotificationPage />} />
              <Route path="/exercise/getByLesson/:lessonId" element={<ExercisePage />} />
              <Route path="level" element={<LevelPage />} />
              <Route path="pupil" element={<PupilPage />} />
              <Route path="completetask" element={<CompleteTaskPage />} />
              <Route path="completelesson" element={<CompleteLessonPage />} />
              <Route path="exercise_statistic" element={<ExerciseStatistic />} />              
              <Route path="logout" element={<Logout />} />

            </Route>
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="resetpassword" element={<ResetPasswordPage />} />
          <Route path="verify" element={<VerifyPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
injectColorsToRoot(lightColors);
injectFontsToRoot();