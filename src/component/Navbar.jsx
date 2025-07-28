// src/layout/Navbar.jsx
import { useContext, useState, useEffect } from "react";
import { Select, Avatar, Space, Flex, Segmented } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";
import { Imgs } from "../assets/theme/images";
import { UserContext } from "../contexts/UserContext";
import {
  injectColorsToRoot,
  lightColors,
  darkColors,
} from "../assets/theme/colors";
import api from "../assets/api/Api";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, reloadUser } = useContext(UserContext);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true"; // true hoặc false
  });
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    injectColorsToRoot(darkMode ? darkColors : lightColors);
  }, [darkMode]);

  const languageOptions = [
    { value: "English", label: "English", icon: Imgs.English },
    { value: "Tiếng Việt", label: "Tiếng Việt", icon: Imgs.VietNam },
  ];

  const selectedLang = i18n.language === "en" ? "English" : "Tiếng Việt";

  const handleLanguageChange = async (value) => {
    const lang = value === "English" ? "en" : "vi";
    i18n.changeLanguage(lang);
    if (userId) {
      try {
        await api.patch(`/user/updateProfile/${userId}`, { language: lang });
        reloadUser(); // Cập nhật lại dữ liệu
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDarkModeToggle = async (value) => {
    const newMode = value === "dark";
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    injectColorsToRoot(newMode ? darkColors : lightColors);

    try {
      await api.patch(`/user/updateProfile/${userId}`, {
        mode: newMode ? "dark" : "light",
      });
      reloadUser(); // nếu muốn cập nhật context
      toast.success(t("updateSuccess", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "0 16px 0 30px", backgroundColor: "#3366FF" }}
    >
      <Space size={0}>
        <h4 style={{ margin: 0, fontWeight: "bold", color: "white" }}>
          Math Kids
        </h4>
        <img width={100} src={logo} alt="Logo" />
      </Space>
      <Space size="large">
        <Segmented
          size="middle"
          shape="round"
          value={darkMode ? "dark" : "light"}
          onChange={handleDarkModeToggle}
          options={[
            { value: "light", icon: <SunOutlined /> },
            { value: "dark", icon: <MoonOutlined /> },
          ]}
        />
        <Select
          value={selectedLang}
          style={{ width: 150 }}
          onChange={handleLanguageChange}
          options={languageOptions.map((opt) => ({
            value: opt.value,
            label: (
              <span>
                <img
                  src={opt.icon}
                  alt={opt.label}
                  width="20"
                  style={{ marginRight: 8 }}
                />
                {opt.label}
              </span>
            ),
          }))}
        />
        <div>
          <Avatar src={user?.image || "https://i.pravatar.cc/100"} />
          <span style={{ marginLeft: 10, fontWeight: "bold", color: "white" }}>
            {user?.fullName || "Admin"}
          </span>
        </div>
      </Space>
    </Flex>
  );
};

export default Navbar;
