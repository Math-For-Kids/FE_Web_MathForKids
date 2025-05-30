import { React } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Imgs } from '../assets/theme/images'
import { useTranslation } from 'react-i18next';

import './Sidebar.css';

const Dashboard = () => {
    const location = useLocation();
    const activeItem = location.pathname;
    const { t, i18n } = useTranslation(['sidebar', 'common']);
    const darkMode = localStorage.getItem('darkMode') === 'true';

    const getIcon = (path, whiteIcon, blueIcon) => {
        return darkMode ? whiteIcon : (activeItem === path ? blueIcon : whiteIcon);
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="sidebar-header">DashStack</div>
                <div className="sidebar-divider"></div>
                <a className="sidebar-a">Admin Pages</a>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`sidebar-item ${activeItem === '/dashboard' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/dashboard', Imgs.dashboardWhite, Imgs.dashboardBlue)}
                            alt="Dashboard"
                            className="sidebar-icon"
                        />{t('dashboard')}
                    </Link>
                    <Link to="/account-user" className={`sidebar-item ${activeItem === '/account-user' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/account-user', Imgs.accountUserWhite, Imgs.accountUserBlue)}
                            alt="accountuser"
                            className="sidebar-icon"
                        /> {t('accountUser')}
                    </Link>
                    <Link to="/testsystem" className={`sidebar-item ${activeItem === '/testsystem' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/testsystem', Imgs.testSystemwhite, Imgs.testSystemblue)}
                            alt="testsystem"
                            className="sidebar-icon"
                        /> {t('testSystem')}
                    </Link>
                    <Link to="/notification" className={`sidebar-item ${activeItem === '/notification' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/notification', Imgs.notificationWhite, Imgs.notificationBlue)}
                            alt="notification"
                            className="sidebar-icon"
                        /> {t('notification')}
                    </Link>
                    <Link to="/completetask" className={`sidebar-item ${activeItem === '/completetask' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/completetask', Imgs.completetaskwhite, Imgs.completetaskblue)}
                            alt="completetask"
                            className="sidebar-icon"
                        /> {t('completetask')}
                    </Link>
                    <Link to="/completelesson" className={`sidebar-item ${activeItem === '/completelesson' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/completelesson', Imgs.completetaskwhite, Imgs.completetaskblue)}
                            alt="completelesson"
                            className="sidebar-icon"
                        /> {t('completelesson')}
                    </Link>
                    <Link to="/profile" className={`sidebar-item ${activeItem === '/profile' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/profile', Imgs.profileWhite, Imgs.profileBlue)}
                            alt="profile"
                            className="sidebar-icon"
                        /> {t('profile')}
                    </Link>

                    <div className="sidebar-divider"></div>
                    <a className="sidebar-a">User Page</a>

                    <Link to="/lesson" className={`sidebar-item ${activeItem === '/lesson' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/lesson', Imgs.lessonWhite, Imgs.lessonBlue)}
                            alt="lesson"
                            className="sidebar-icon"
                        /> {t('lesson')}
                    </Link>
                    <Link to="/exercise" className={`sidebar-item ${activeItem === '/exercise' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/exercise', Imgs.exerciseWhite, Imgs.exerciseBlue)}
                            alt="exercise"
                            className="sidebar-icon"
                        /> {t('exercise')}
                    </Link>
                    <Link to="/assessment" className={`sidebar-item ${activeItem === '/assessment' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/assessment', Imgs.questionWhite, Imgs.questionBlue)}
                            alt="assessment"
                            className="sidebar-icon"
                        /> {t('assessment')}
                    </Link>
                    <Link to="/questiontest" className={`sidebar-item ${activeItem === '/questiontest' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/questiontest', Imgs.questionTestWhite, Imgs.questionTestBlue)}
                            alt="questiontest"
                            className="sidebar-icon"
                        />{t('questionTest')}
                    </Link>
                    <Link to="/systemtask" className={`sidebar-item ${activeItem === '/systemtask' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/systemtask', Imgs.systemTaskWhite, Imgs.systemTaskBlue)}
                            alt="systemtask"
                            className="sidebar-icon"
                        /> {t('systemTasks')}
                    </Link>

                    <Link to="/rewards" className={`sidebar-item ${activeItem === '/rewards' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/rewards', Imgs.rewardWhite, Imgs.rewardBlue)}
                            alt="rewards"
                            className="sidebar-icon"
                        /> {t('reward')}
                    </Link>
                    <Link to="/pupil" className={`sidebar-item ${activeItem === '/pupil' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/pupil', Imgs.pupilwhite, Imgs.pupilblue)}
                            alt="pupil"
                            className="sidebar-icon"
                        /> {t('pupil')}
                    </Link>

                    <div className="sidebar-divider"></div>
                    <a className="sidebar-a">Settings & Logout</a>

                    <Link to="/setting" className={`sidebar-item ${activeItem === '/setting' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/setting', Imgs.settingWhite, Imgs.settingBlue)}
                            alt="setting"
                            className="sidebar-icon"
                        />{t('setting')}
                    </Link>
                    <Link to="/logout" className={`sidebar-item ${activeItem === '/logout' ? 'active' : ''}`}>
                        <img
                            src={getIcon('/logout', Imgs.logoutWhite, Imgs.logoutBlue)}
                            alt="Logout"
                            className="sidebar-icon"
                        /> {t('logout')}
                    </Link>
                </nav>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;