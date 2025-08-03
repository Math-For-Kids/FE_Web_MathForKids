// src/layout/Navbar.jsx
import { useContext, useState, useEffect } from "react";
import { Select, Avatar, Space, Flex, Segmented } from "antd";
import { MoonOutlined, SunOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";
import { Imgs } from "../assets/theme/images";
import { UserContext } from "../contexts/UserContext";
import { toast } from "react-toastify";
import {
  injectColorsToRoot,
  lightColors,
  darkColors,
} from "../assets/theme/colors";
import api from "../assets/api/Api";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, reloadUser } = useContext(UserContext);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode"));
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    injectColorsToRoot(darkMode === "dark" ? darkColors : lightColors);
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
    console.log(value);
    setDarkMode(value);
    localStorage.setItem("darkMode", value);
    injectColorsToRoot(newMode ? darkColors : lightColors);

    try {
      await api.patch(`/user/updateProfile/${userId}`, {
        mode: newMode ? "dark" : "light",
      });
      reloadUser(); // nếu muốn cập nhật context
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
      style={{
        padding: "0 16px 0 30px",
        backgroundColor: "var(--background-navbar)",
      }}
    >
      <Space size={0}>
        <h4
          style={{
            margin: 0,
            fontWeight: "bold",
            color: "var(--color-navbar)",
          }}
        >
          Math Kids
        </h4>
        <img width={100} src={logo} alt="Logo" />
      </Space>
      <Space size="large">
        <Segmented
          size="middle"
          shape="round"
          value={darkMode}
          onChange={handleDarkModeToggle}
          options={[
            { value: "light", icon: <SunOutlined /> },
            { value: "dark", icon: <MoonOutlined /> },
          ]}
        />
        <Select
          suffixIcon={
            <DownOutlined style={{ color: "var(--dropdown-icon)" }} />
          }
          value={selectedLang}
          style={{ width: 150 }}
          onChange={handleLanguageChange}
          options={languageOptions.map((opt) => ({
            value: opt.value,
            label: (
              <span style={{ color: "var(--color-text)" }}>
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
          <span
            style={{
              marginLeft: 10,
              fontWeight: "bold",
              color: "var(--color-navbar)",
            }}
          >
            {user?.fullName || "Admin"}
          </span>
        </div>
      </Space>
    </Flex>
  );
};

export default Navbar;
