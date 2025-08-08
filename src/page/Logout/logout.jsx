import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../assets/api/Api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Logout = () => {
  const { t, i18n } = useTranslation(["common"]);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmLogout = async () => {
      const confirmed = window.confirm(t("logout_confirm"));
      if (confirmed) {
        try {
          await api.post("/auth/logout");
          localStorage.removeItem("token");
          localStorage.removeItem("userID");
          localStorage.setItem("darkMode", "light");
          toast.success("Logout successfully!");
          window.location.href = "/login";
        } catch (error) {
          toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
          navigate("/dashboard"); // Quay về dashboard nếu lỗi
        }
      } else {
        // Nếu hủy thì quay lại trang trước đó (hoặc dashboard)
        navigate(-1);
      }
    };

    confirmLogout();
  }, [navigate]);

  return null; // Không cần render gì cả
};

export default Logout;
