import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Select, Switch, Button } from 'antd';
import { toast } from 'react-toastify';
import api from '../../assets/api/Api';
import { useTranslation } from 'react-i18next';
import { injectColorsToRoot, lightColors, darkColors } from '../../assets/theme/colors';
import './setting.css';

const Setting = () => {
    const [language, setLanguage] = useState('Vietnamese');
    const [notification, setNotification] = useState(false);
    const { t } = useTranslation(['setting', 'common']);
    const userID = localStorage.getItem('userID');
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    useEffect(() => {
        injectColorsToRoot(darkMode ? darkColors : lightColors);

        const fetchUserSettings = async () => {
            try {
                const response = await api.get(`/user/${userID}`);
                const user = response.data;

                const isDark = user?.mode === 'dark';
                setDarkMode(isDark);
                localStorage.setItem('darkMode', JSON.stringify(isDark));
                injectColorsToRoot(isDark ? darkColors : lightColors);
            } catch (error) {
                toast.error(t('fetchFailed', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        };
        fetchUserSettings();
    }, [userID, t]);

    const handleDarkModeToggle = async () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
        injectColorsToRoot(newDarkMode ? darkColors : lightColors);

        try {
            await api.put(`/user/${userID}`, {
                mode: newDarkMode ? 'dark' : 'light',
            });
        } catch (error) {
            toast.error(t('updateFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleRestoreDefaults = async () => {
        setLanguage('Vietnamese');
        setDarkMode(false);
        setNotification(false);

        localStorage.setItem('darkMode', JSON.stringify(false));
        injectColorsToRoot(lightColors);

        try {
            await api.put(`/user/${userID}`, {
                mode: 'light',
            });
            toast.success(t('restoreSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch (error) {
            toast.error(t('updateFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    return (
        <div className="containers">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementsetting')}</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="settings-card">
                        {/* Uncomment and update this section if language selection is needed */}
                        {/* <div className="setting-item">
                            <div className="setting-icon globe" />
                            <div className="setting-content">
                                <label>{t('language')}</label>
                                <p>{t('sublanguage')}</p>
                            </div>
                            <Select
                                value={language}
                                onChange={(value) => setLanguage(value)}
                                className="custom-select"
                            >
                                <Select.Option value="Vietnamese">{t('vietnam')}</Select.Option>
                                <Select.Option value="English">{t('english')}</Select.Option>
                            </Select>
                        </div> */}

                        <div className="setting-item">
                            <div className="setting-icon moon" />
                            <div className="setting-content">
                                <label>{t('darkmode')}</label>
                                <p>{t('subdark')}</p>
                            </div>
                            <Switch
                                checked={darkMode}
                                onChange={handleDarkModeToggle}
                                className="custom-switch"
                            />
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon bell" />
                            <div className="setting-content">
                                <label>{t('notification')}</label>
                                <p>{t('subnotification')}</p>
                            </div>
                            <Switch
                                checked={notification}
                                onChange={() => setNotification(!notification)}
                                className="custom-switch"
                            />
                        </div>

                        <Button
                            className="restore-button"
                            onClick={handleRestoreDefaults}
                            block
                        >
                            {t('restoreDefaults')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;