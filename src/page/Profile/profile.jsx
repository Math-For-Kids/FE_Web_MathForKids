import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar";
import { Input, Button, Select, Modal, DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../assets/api/Api";
import "./profile.css";

const Profile = () => {
  const { reloadUser } = useContext(UserContext);
  const { t, i18n } = useTranslation(["profile", "common"]);
  const { id } = useParams();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [userData, setUserData] = useState({});
  const [emailChanged, setEmailChanged] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState(""); // 'email' or 'phone'
  const [errors, setErrors] = useState({}); // New state for validation errors
  const { Option } = Select;

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, [userID, id, navigate, t]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/user/${userID}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        const {
          id,
          fullName,
          phoneNumber,
          email,
          gender,
          dateOfBirth,
          address,
          image,
        } = response.data;
        let formattedDOB = "";
        if (dateOfBirth?.seconds) {
          formattedDOB = moment(dateOfBirth.seconds * 1000).format(
            "YYYY-MM-DD"
          );
        } else if (typeof dateOfBirth === "string") {
          formattedDOB = moment(dateOfBirth).isValid()
            ? moment(dateOfBirth).format("YYYY-MM-DD")
            : "";
        }
        setUserData({
          id: id || "",
          fullName: fullName || "",
          phoneNumber: phoneNumber || "",
          email: email || "",
          gender: gender || "",
          dateOfBirth: formattedDOB,
          address: address || "",
          image: image || "https://i.pravatar.cc/100",
        });
        setErrors({}); // Clear errors on successful fetch
      } else {
        toast.error(t("fetchFailed", { ns: "common" }), {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
      if (error.response?.status === 401) navigate("/login");
    }
  };

  // Handle image upload
  const handleImageUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.patch(
        `/user/updateImageProfile/${userID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        setUserData({ ...userData, image: response.data.image });
        toast.success(t("imageUploadSuccess", { ns: "common" }));
      } else {
        toast.error(t("imageUploadFailed", { ns: "common" }), {
          position: "top-right",
          autoClose: 3000,
        });
      }
      fetchUserData();
    } catch (error) {
      toast.error(
        error.response?.data?.message?.[i18n.language] ||
          t("imageUploadFailed", { ns: "common" }),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!userData.phoneNumber || !/^\d{10}$/.test(userData.phoneNumber)) {
      newErrors.phoneNumber = t("numberPhoneRequired");
    }
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = t("emailRequired");
    }
    if (!userData.dateOfBirth || userData.dateOfBirth === "") {
      newErrors.dateOfBirth = t("dateOfBirthRequired");
    } else {
      const dob = new Date(userData.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        newErrors.dateOfBirth = t("dateOfBirthdodRequired");
      } else {
        const ageDifMs = now - dob;
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 20) {
          newErrors.dateOfBirth = t("dateOfBirtholdRequired");
        }
      }
    }
    if (!userData.address || userData.address === "") {
      newErrors.address = t("addressRequired");
    }
    if (!userData.fullName || userData.fullName === "") {
      newErrors.fullName = t("fullNameRequired");
    }
    if (!userData.gender || userData.gender === "") {
      newErrors.gender = t("genderRequired");
    }
    setErrors(newErrors); // Update error state
    return newErrors;
  };

  // Handle profile update
  const handleUpdate = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const payload = {
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          gender: userData.gender,
          dateOfBirth: userData.dateOfBirth,
          address: userData.address,
        };
        const response = await api.patch(
          `/user/updateProfile/${userID}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(t("updateSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
          setUserData({ ...userData, ...response.data });
          setErrors({}); // Clear errors on successful update
          reloadUser();
        } else {
          toast.error(t("updateFailed", { ns: "common" }), {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Handle send OTP
  const handleSendOTP = async (purpose) => {
    let isValid = true;
    if (purpose === "email") {
      if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
        toast.error(t("emailInvalid"));
        isValid = false;
      }
    } else if (purpose === "phoneNumber") {
      if (!newPhoneNumber || !/^\d{10}$/.test(newPhoneNumber)) {
        toast.error(t("phoneInvalid"));
        isValid = false;
      }
    }
    if (!isValid) return false;

    try {
      const res = await api.post(
        `/auth/sendOtpByEmail/${userData.email}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.status === 200) {
        toast.success(t("otpSent"));
        setIsEmailModalVisible(false);
        setIsPhoneModalVisible(false);
        setOtpModalVisible(true);
        setOtpPurpose(purpose);
        return true;
      }
      toast.error(t("otpSendFailed", { ns: "common" }), {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    } catch (error) {
      toast.error(
        error.response?.data?.message?.[i18n.language] ||
          t("otpSendFailed", { ns: "common" }),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return false;
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode) {
      toast.error(t("otpRequired"));
      return;
    }
    if (!userID) {
      toast.error(t("userIdRequired", { ns: "common" }));
      return;
    }
    try {
      setIsVerifyingOTP(true);
      const res = await api.post(
        `/auth/verifyOTP/${userID}`,
        { otpCode },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.message) {
        if (otpPurpose === "email") {
          const updateRes = await api.patch(
            `/user/updateEmail/${userID}`,
            { newEmail },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (updateRes.status === 200) {
            setUserData({ ...userData, email: newEmail });
            setEmailChanged(false);
            toast.success(
              updateRes.data.message[t("ns")] ||
                t("updateSuccess", { ns: "common" })
            );
          } else {
            toast.error(updateRes.response?.data?.message?.[i18n.language], {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else if (otpPurpose === "phoneNumber") {
          const updateRes = await api.patch(
            `/user/updatePhone/${userID}`,
            { newPhoneNumber },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (updateRes.status === 200) {
            setUserData({ ...userData, phoneNumber: newPhoneNumber });
            setPhoneChanged(false);
            fetchUserData();
            toast.success(
              updateRes.data.message[t("ns")] ||
                t("updateSuccess", { ns: "common" })
            );
          } else {
            toast.error(updateRes.response?.data?.message?.[i18n.language], {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }
        setOtpModalVisible(false);
        setOtpCode("");
        setOtpPurpose("");
      } else {
        toast.error(t("otpInvalid"));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message?.[i18n.language] || t("otpInvalid"),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  return (
    <div className="containers">
      {/* <Navbar /> */}
      <h1 className="container-title">{t("profile")}</h1>
      <div className="profile-container">
        <div className="flex justify-between items-center mb-4">
          <div className="profile-card">
            <div className="avatar-section">
              <img
                src={userData.image}
                alt="Profile Image"
                className="avatar-img"
              />
              <div className="upload-text">
                <Upload
                  customRequest={handleImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>{t("uploadPhoto")}</Button>
                </Upload>
              </div>
            </div>
            <div className="form-wrapper">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("fullName")}</label>
                  <Input
                    className="inputprofile"
                    placeholder={t("enterFullName")}
                    value={userData.fullName}
                    onChange={(e) =>
                      setUserData({ ...userData, fullName: e.target.value })
                    }
                    status={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.fullName}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("birthday")}</label>
                  <DatePicker
                    className="inputprofile"
                    placeholder={t("inputDateOfBirth")}
                    style={{ width: "100%", height: "50px" }}
                    value={
                      userData.dateOfBirth
                        ? moment(userData.dateOfBirth, "YYYY-MM-DD")
                        : null
                    }
                    onChange={(date) =>
                      setUserData({
                        ...userData,
                        dateOfBirth: date ? date.format("YYYY-MM-DD") : "",
                      })
                    }
                    status={errors.dateOfBirth ? "error" : ""}
                  />
                  {errors.dateOfBirth && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.dateOfBirth}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("address")}</label>
                  <Input
                    className="inputprofile"
                    placeholder={t("enterAddress")}
                    value={userData.address}
                    onChange={(e) =>
                      setUserData({ ...userData, address: e.target.value })
                    }
                    status={errors.address ? "error" : ""}
                  />
                  {errors.address && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.address}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("gender")}</label>
                  <Select
                    className="inputprofile"
                    style={{ width: "100%", height: "50px" }}
                    placeholder={t("selectionGender")}
                    value={userData.gender || undefined}
                    onChange={(value) =>
                      setUserData({ ...userData, gender: value })
                    }
                    status={errors.gender ? "error" : ""}
                  >
                    <Select.Option value="Male">{t("male")}</Select.Option>
                    <Select.Option value="Female">{t("female")}</Select.Option>
                  </Select>
                  {errors.gender && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.gender}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("email")}</label>
                  <Input
                    className="inputprofile"
                    style={{ height: "50px" }}
                    placeholder={t("enterEmail")}
                    value={userData.email}
                    disabled
                    suffix={
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setNewEmail(userData.email);
                          setIsEmailModalVisible(true);
                        }}
                        disabled={emailChanged}
                      >
                        {t("change")}
                      </Button>
                    }
                    status={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("phoneNumber")}</label>
                  <Input
                    className="inputprofile"
                    style={{ height: "50px" }}
                    placeholder={t("enterPhoneNumber")}
                    value={userData.phoneNumber}
                    disabled
                    suffix={
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setNewPhoneNumber(userData.phoneNumber);
                          setIsPhoneModalVisible(true);
                        }}
                        disabled={phoneChanged}
                      >
                        {t("change")}
                      </Button>
                    }
                    status={errors.phoneNumber ? "error" : ""}
                  />
                  {errors.phoneNumber && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Modal
              title={
                <div style={{ textAlign: "center", fontSize: "24px" }}>
                  {t("changeEmail")}
                </div>
              }
              open={isEmailModalVisible}
              onCancel={() => {
                setIsEmailModalVisible(false);
                setNewEmail("");
              }}
              footer={null}
              className="modal-content"
            >
              <Input
                placeholder={t("enterNewEmail")}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <div className="button-row">
                <Button
                  className="save-button"
                  onClick={() => handleSendOTP("email")}
                  block
                >
                  {t("change")}
                </Button>
              </div>
            </Modal>
            <Modal
              title={
                <div style={{ textAlign: "center", fontSize: "24px" }}>
                  {t("changePhoneNumber")}
                </div>
              }
              open={isPhoneModalVisible}
              onCancel={() => {
                setIsPhoneModalVisible(false);
                setNewPhoneNumber("");
              }}
              footer={null}
              className="modal-content"
            >
              <Input
                placeholder={t("enterNewPhone")}
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <div className="button-row">
                <Button
                  className="save-button"
                  onClick={() => handleSendOTP("phoneNumber")}
                  block
                >
                  {t("change")}
                </Button>
              </div>
            </Modal>
            <Modal
              title={
                <div style={{ textAlign: "center", fontSize: "24px" }}>
                  {t("verifyOTP")}
                </div>
              }
              open={otpModalVisible}
              footer={null}
              onCancel={() => {
                setOtpModalVisible(false);
                setOtpCode("");
              }}
              className="modal-content"
            >
              <Input
                placeholder={t("enterOTP")}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <div className="button-row">
                <Button
                  className="save-button"
                  onClick={() => handleSendOTP(otpPurpose)}
                  block
                >
                  {t("resendOTP")}
                </Button>
                <Button
                  className="save-button"
                  onClick={handleVerifyOTP}
                  block
                  loading={isVerifyingOTP}
                >
                  {t("verify")}
                </Button>
              </div>
            </Modal>
            <div className="btn-wrapper">
              <Button className="update-btn" onClick={handleUpdate}>
                {t("update", { ns: "common" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
