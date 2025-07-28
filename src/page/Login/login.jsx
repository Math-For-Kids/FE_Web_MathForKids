import React, { useState } from "react";
import "./login.css";
import { Input, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../assets/api/Api";

const Login = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const navigate = useNavigate();

  const isPhoneNumber = (str) => /^0\d{9}$/.test(str); // Ví dụ định dạng: 10 chữ số bắt đầu bằng 0
  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.toLowerCase());

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorText("");

    if (!input.trim()) {
      setErrorText("Please enter phone number or email.");
      return;
    }

    const isOnlyNumbers = /^\d+$/.test(input);
    const isValidPhone = isPhoneNumber(input);
    const isValidEmail = isEmail(input);

    if (isValidPhone || isValidEmail) {
      setLoading(true);
      try {
        const url = isValidPhone
          ? `/auth/sendOtpByPhone/${input}?role=admin`
          : `/auth/sendOtpByEmail/${input}?role=admin`;
        const response = await api.post(url);

        const userID = response.data.userId;
        localStorage.setItem("userID", userID);
        localStorage.setItem("typeInput", isValidPhone ? "phone" : "email");
        localStorage.setItem("userInput", input);

        toast.success(response.data.message?.en, {
          position: "top-right",
          autoClose: 2000,
        });

        navigate("/verify");
      } catch (error) {
        toast.error(error.response?.data?.message?.en, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    } else {
      if (isOnlyNumbers) {
        setErrorText("Phone number must be 10 digits and start with 0!");
      } else {
        setErrorText(
          "Invalid email format. Please enter a valid email address."
        );
      }
    }
  };

  return (
    <div className="login">
      <div className="wave"></div>
      <div className="containtlogin">
        <h2 className="titlelogin">Login as Admin</h2>
        <form onSubmit={handleLogin}>
          <div className="contentlogin">
            <div>
              <label className="labellogin">Phone Number or Email:</label>
              <Input
                className="inputlogin"
                type="text"
                placeholder="Enter phone number or email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                status={errorText ? "error" : ""}
              />
              {/* Vùng hiển thị lỗi */}
              <div style={{ minHeight: "25px" }}>
                {errorText && (
                  <small style={{ color: "red", fontSize: "13px" }}>
                    {errorText}
                  </small>
                )}
              </div>
            </div>
            <div className="buttonlogins">
              <Button className="buttonlogin" htmlType="submit">
                {loading ? (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 20, color: "#fff" }}
                        spin
                      />
                    }
                  />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
