import React, { useState } from "react";
import { Input, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "./Verify.css";
import { toast } from "react-toastify";
import api from "../../assets/api/Api";

const Verify = () => {
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const typeInput = localStorage.getItem("typeInput");
  const userInput = localStorage.getItem("userInput");

  console.log(userInput);
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setErrorText("");

      if (value && index < 3) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(paste)) {
      setOtp(paste.split(""));
      setErrorText("");
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };
  const handleResend = async () => {
    setLoadingResend(true);
    try {
      const url =
        typeInput === "phone"
          ? `/auth/sendOtpByPhone/${userInput}?role=admin`
          : `/auth/sendOtpByEmail/${userInput}?role=admin`;
      const response = await api.post(url);
      toast.success(response.data.message.en, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message?.en, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingResend(false);
    }
  };
  const handleVerify = async () => {
    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 4 || otp.some((digit) => digit === "")) {
      setErrorText("Please enter all 4 digits OTP code.");
      return;
    }

    setLoadingVerify(true);
    try {
      const response = await api.post(
        `/auth/verifyAndAuthentication/${userID}`,
        {
          otpCode: enteredOTP,
        }
      );
      const { token, mode } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("darkMode", mode);
      toast.success("OTP verified successfully!", {
        theme: mode === "dark" ? "dark" : "light",
      });
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message?.en, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="login">
      <div className="wave"></div>
      {/* <div className="back-button" onClick={handleBack}>←</div> */}
      <div className="containtverify">
        <h2 className="titlelogin">Verification</h2>
        <p className="subtitle">
          The OTP code is sent to:{" "}
          <span style={{ fontWeight: "bold" }}>{userInput}</span>
        </p>
        <div className="contentverify">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-input-${index}`}
                className="otp-input"
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onPaste={handlePaste}
                onKeyDown={(e) => handleKeyDown(e, index)}
                status={errorText ? "error" : ""}
              />
            ))}
          </div>

          {/* Vùng hiển thị lỗi */}
          <div style={{ minHeight: "25px" }}>
            {errorText && (
              <small style={{ color: "red", fontSize: "13px" }}>
                {errorText}
              </small>
            )}
          </div>

          <div className="buttonverifys">
            {loadingResend ? (
              <div className="buttonverify">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 20, color: "#fff" }}
                      spin
                    />
                  }
                />
              </div>
            ) : (
              <Button className="buttonverify" onClick={handleResend}>
                Resend OTP
              </Button>
            )}

            {loadingVerify ? (
              <div className="buttonverify">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 20, color: "#fff" }}
                      spin
                    />
                  }
                />
              </div>
            ) : (
              <Button className="buttonverify" onClick={handleVerify}>
                Verify
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
