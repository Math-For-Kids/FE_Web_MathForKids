import { useState, useEffect } from "react";
import "./accountuser.css";
import Navbar from "../../component/Navbar";
import {
  Input,
  Button,
  Select,
  Modal,
  DatePicker,
  Table,
  Pagination,
  Switch,
  message,
  Flex,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  FaMars,
  FaVenus,
  FaCrown,
  FaGraduationCap,
  FaUsers,
  FaUserGraduate,
  FaEdit,
  FaEllipsisH,
  FaPlus,
} from "react-icons/fa";
import api from "../../assets/api/Api";

const AccountUser = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [edittingUser, setEditingUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [filterStatus, setFilterStatus] = useState("all"); // all / enabled / disabled
  const [userData, setUserData] = useState([]);
  const [pupilData, setPupilData] = useState([]);
  const [errors, setErrors] = useState({});
  const [countAll, setCountAll] = useState("");
  const [visibleUser, setVisibleUser] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [visiblePupil, setVisiblePupil] = useState([]); // Add this state for visible pupils if needed
  const [searchQuery, setSearchQuery] = useState("");
  const { t, i18n } = useTranslation(["account", "common"]);
  const { Option } = Select;
  const userPerPage = 10;
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setVisibleUser(userData); // Reset to all when search is empty
    } else {
      const filtered = userData.filter((user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setVisibleUser(filtered);
    }
  }, [searchQuery, userData]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        setUserData([]);
        setVisibleUser([]);
        setNextPageToken(null);
        if (filterStatus !== "all") {
          await fetchUsersByDisabled(null, filterStatus, selectedRole);
        } else {
          await fetchUsersByRole(null, selectedRole);
        }

        setTimeout(() => setLoading(false), 0);
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchUsers();
  }, [filterStatus, selectedRole]);

  //   const fetchAllUsers = async (token = null) => {
  //     try {
  //       let url = `/user?pageSize=${userPerPage}`;
  //       if (token) {
  //         url += `&startAfterId=${token}`;
  //       }

  //       const response = await api.get(url);
  //       const newParents = response.data.data || [];
  //       const responses = await api.get(`/user/countAll`);
  //       setCountAll(Number(responses.data.count));
  //       setUserData((prev) => {
  //         const existingIds = new Set(prev.map((parent) => parent.id));
  //         const uniqueNewParents = newParents.filter(
  //           (parent) => !existingIds.has(parent.id)
  //         );
  //         return [...prev, ...uniqueNewParents];
  //       });
  //       setVisibleUser((prev) => {
  //         const existingIds = new Set(prev.map((parent) => parent.id));
  //         const uniqueNewParents = newParents.filter(
  //           (parent) => !existingIds.has(parent.id)
  //         );
  //         return [...prev, ...uniqueNewParents];
  //       });
  //       setNextPageToken(response.data.nextPageToken || null);
  //     } catch (error) {
  //       toast.error(error.response?.data?.message?.[i18n.language], {
  //         position: "top-right",
  //         autoClose: 3000,
  //       });
  //     }
  //   };

  const fetchUsersByDisabled = async (token = null, isDisabled, role) => {
    try {
      let url = `/user/filterByDisabledStatus?pageSize=${userPerPage}&role=${role}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }

      const response = await api.get(url);
      const newParents = response.data.data || [];
      const responses = await api.get(
        `/user/countByDisabledStatus?isDisabled=${isDisabled}&role=${role}`
      );
      setCountAll(responses.data.count);
      setUserData((prev) => {
        const existingIds = new Set(prev.map((parent) => parent.id));
        const uniqueNewParents = newParents.filter(
          (parent) => !existingIds.has(parent.id)
        );
        return [...prev, ...uniqueNewParents];
      });
      setVisibleUser((prev) => {
        const existingIds = new Set(prev.map((parent) => parent.id));
        const uniqueNewParents = newParents.filter(
          (parent) => !existingIds.has(parent.id)
        );
        return [...prev, ...uniqueNewParents];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchUsersByRole = async (token = null, role) => {
    try {
      let url = `/user/filterByRole?pageSize=${userPerPage}&role=${role}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const response = await api.get(url);
      const newParents = response.data.data || [];
      const responses = await api.get(`/user/countByRole?role=${role}`);
      setCountAll(responses.data.count);
      setUserData((prev) => {
        const existingIds = new Set(prev.map((parent) => parent.id));
        const uniqueNewParents = newParents.filter(
          (parent) => !existingIds.has(parent.id)
        );
        return [...prev, ...uniqueNewParents];
      });
      setVisibleUser((prev) => {
        const existingIds = new Set(prev.map((parent) => parent.id));
        const uniqueNewParents = newParents.filter(
          (parent) => !existingIds.has(parent.id)
        );
        return [...prev, ...uniqueNewParents];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchAllPupils = async (userId, token = null, isDisabled = false) => {
    try {
      let url = `/pupil/getEnabledPupil/${userId}?pageSize=50&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const response = await api.get(url);
      const newPupils = response.data || [];
      // const responses = await api.get(`/pupil/countAll`);
      // setCountAll(Number(responses.data.count));
      setPupilData(newPupils); // Replace pupilData with new data
      setVisiblePupil(newPupils); // Replace visiblePupil with new data
      //   setNextPageToken(response.data.nextPageToken || null);
      return newPupils; // Return pupils for immediate use
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
      return [];
    }
  };

  const loadMore = async () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      if (filterStatus !== "all") {
        await fetchUsersByDisabled(nextPageToken, filterStatus, selectedRole);
      } else {
        await fetchUsersByRole(nextPageToken, selectedRole);
      }
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const response = await api.post(`/user`, edittingUser);
        const newuser = response.data.id;
        await api.put(`/user/${newuser}`, { isVerify: true });
        toast.success(t("addSuccess", { ns: "common" }), {
          position: "top-right",
          autoClose: 2000,
        });
        closeModal();
      } catch (error) {
        toast.success(t("updateSuccess", { ns: "common" }), {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } else {
      toast.error(t("errorSavingData", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleToggleDisabled = async (user) => {
    try {
      await api.patch(`/user/updateProfile/${user.id}`, {
        isDisabled: !user.isDisabled,
      });
      setUserData((prev) =>
        prev.map((e) =>
          e.id === user.id ? { ...e, isDisabled: !user.isDisabled } : e
        )
      );
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

  const validateForm = () => {
    const newErrors = {};
    if (
      !edittingUser?.phoneNumber ||
      !/^\d{10}$/.test(edittingUser.phoneNumber)
    ) {
      newErrors.phoneNumber = t("numberPhoneRequired");
    } else {
      const phoneExists = userData.some(
        (user) =>
          user.phoneNumber === edittingUser.phoneNumber &&
          (!edittingUser.id || user.id !== edittingUser.id)
      );
      if (phoneExists) {
        newErrors.phoneNumber = t("phoneExists");
      }
    }
    if (!edittingUser?.email || !/\S+@\S+\.\S+/.test(edittingUser.email)) {
      newErrors.email = t("emailRequired");
    } else {
      const emailExists = userData.some(
        (user) =>
          user.email.toLowerCase() === edittingUser.email.toLowerCase() &&
          (!edittingUser.id || user.id !== edittingUser.id)
      );
      if (emailExists) {
        newErrors.email = t("emailExists");
      }
    }
    if (!edittingUser?.dateOfBirth || edittingUser.dateOfBirth === "") {
      newErrors.dateOfBirth = t("dateOfBirthRequired");
    } else {
      const dob = new Date(edittingUser.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        newErrors.dateOfBirth = t("dateOfBirthdodRequired");
      } else {
        const ageDifMs = now - dob;
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 30) {
          newErrors.dateOfBirth = t("dateOfBirtholdRequired");
        }
      }
    }
    if (!edittingUser?.address || edittingUser.address === "") {
      newErrors.address = t("addressRequired");
    }
    if (!edittingUser?.fullName || edittingUser.fullName === "") {
      newErrors.fullName = t("fullNameRequired");
    }
    if (!edittingUser?.gender || edittingUser.gender === "") {
      newErrors.gender = t("genderRequired");
    }
    if (!edittingUser?.role || edittingUser.role === "") {
      newErrors.role = t("roleRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openModal = () => {
    setEditingUser({ role: "admin" });
    setIsModalOpen(true);
  };

  const openDetailModal = async (user) => {
    try {
      setSelectedUserDetail({ ...user, children: [] });
      // Fetch pupil data
      const pupils = await fetchAllPupils(user.id, null, false);
      // Update selectedUserDetail with pupils
      setSelectedUserDetail({ ...user, children: pupils });
      // Open the modal
      setDetailModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedUserDetail(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const renderGenderIcon = (gender) => {
    if (gender.toLowerCase() === "male") {
      return <FaMars className="gender-icon" style={{ color: "#35A6FF" }} />;
    } else if (gender.toLowerCase() === "female") {
      return <FaVenus className="gender-icon" style={{ color: "#FF1493" }} />;
    }
    return null;
  };

  const renderRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <FaCrown className="role-icon" style={{ color: "#FFF82A" }} />;
      case "pupil":
        return (
          <FaGraduationCap className="role-icon" style={{ color: "#1EFF37" }} />
        );
      case "user":
        return <FaUsers className="role-icon" style={{ color: "#9b59b6" }} />;
      default:
        return null;
    }
  };
  // Ant Design Table columns
  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, record, index) => {
        if (record.isMoreButtonRow && visibleUser.length < countAll) {
          return {
            children: (
              <Flex justify="center" align="center">
                {loadingMore ? (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 20 }} spin />
                    }
                  />
                ) : (
                  <Button className="load-more-btn" onClick={loadMore}>
                    {t("More", { ns: "common" })}
                  </Button>
                )}
              </Flex>
            ),
            props: {
              colSpan: columns.length,
            },
          };
        }
        return index + 1;
      },
      align: "center",
    },
    {
      title: t("fullName"),
      dataIndex: "fullName",
      key: "fullName",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.fullName;
      },
      width: 150,
    },
    {
      title: t("email"),
      dataIndex: "email",
      key: "email",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.email;
      },
      width: 200,
    },
    {
      title: t("numberPhone"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.phoneNumber;
      },
      width: 150,
    },
    {
      title: t("gender"),
      dataIndex: "gender",
      key: "gender",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return renderGenderIcon(record.gender);
      },
      width: 100,
      align: "center",
    },
    // {
    //   title: t("role"),
    //   dataIndex: "role",
    //   key: "role",
    //   width: 80,
    //   align: "center",
    //   render: (role) => renderRoleIcon(role),
    // },
    {
      title: t("action", { ns: "common" }),
      key: "action",
      align: "center",
      width: 250,
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <div className="buttonaction">
            <button
              className="text-white buttondetail buttonaction"
              onClick={() => openDetailModal(record)}
            >
              <FaEllipsisH className="iconupdate" />
              {t("more_info")}
            </button>
          </div>
        );
      },
    },
    {
      title: t("available", { ns: "common" }),
      key: "available",
      width: 100,
      align: "center",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          record.id !== userID && (
            <Switch
              checked={!record.isDisabled}
              onChange={() => handleToggleDisabled(record)}
              className="custom-switch"
            />
          )
        );
      },
    },
  ];

  // Pupil Table columns for detail modal
  const pupilColumns = [
    // {
    //   title: t(".no", { ns: "common" }),
    //   dataIndex: "index",
    //   key: "index",
    //   width: 80,
    //   render: (_, __, index) => index + 1,
    // },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      render: (image, child) => (
        <img
          src={image || "https://i.pravatar.cc/100"}
          alt={child.nickName}
          width="50"
          height="50"
          style={{
            objectFit: "cover",
            borderRadius: "50px",
            border: "2px solid #ccc",
          }}
        />
      ),
      align: "center",
    },
    {
      title: t("fullName"),
      dataIndex: "fullName",
      key: "fullName",
    },
    // {
    //   title: t("nickName"),
    //   dataIndex: "nickName",
    //   key: "nickName",
    // },
    {
      title: t("gender"),
      dataIndex: "gender",
      key: "gender",
      width: 100,
      align: "center",
      render: (gender) => renderGenderIcon(gender),
    },
    // {
    //   title: t("dateOfBirth"),
    //   dataIndex: "dateOfBirth",
    //   key: "dateOfBirth",
    //   render: (dateOfBirth) => formatFirebaseTimestamp(dateOfBirth),
    // },
    {
      title: t("grade"),
      dataIndex: "grade",
      key: "grade",
      align: "center",
    },
  ];

  return (
    <div className="containers">
      {/* <Navbar /> */}
      {/* <div className="title-search"> */}
      <h1 className="container-title">{t("managementAccountUser")}</h1>
      {/* <div className="search">
                    <Input
                        type="text"
                        className="inputsearch"
                        placeholder={t('searchPlaceholder', { ns: 'common' })}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                    />
                </div> */}
      {/* </div> */}
      <div className="containers-content">
        <div className="filter-bar">
          <div className="filter-containers">
            <span className="filter-icon">
              <svg
                className="iconfilter"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              <button className="filter-text">
                {t("filterBy", { ns: "common" })}
              </button>
            </span>
            <Select
              className="filter-dropdown"
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              placeholder={t("role")}
            >
              {/* <Select.Option value="all">{t('rolefilter')}</Select.Option> */}
              <Select.Option value="user">{t("roleUser")}</Select.Option>
              <Select.Option value="admin">{t("roleAdmin")}</Select.Option>
            </Select>
            <Select
              className="filter-dropdown"
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value);
              }}
              style={{ minWidth: "150px" }}
            >
              <Select.Option value="all">
                {t("status", { ns: "common" })}
              </Select.Option>
              <Select.Option value="true">
                {t("no", { ns: "common" })}
              </Select.Option>
              <Select.Option value="false">
                {t("yes", { ns: "common" })}
              </Select.Option>
            </Select>
          </div>
          {selectedRole == "admin" && (
            <Button className="rounded-add" onClick={() => openModal("add")}>
              <Flex justify="center" align="center" gap="small">
                <FaPlus />
                <span>{t("addNew", { ns: "common" })}</span>
              </Flex>
            </Button>
          )}
        </div>
        {/* <div className="table-container-user"> */}
        {loading ? (
          <Flex
            justify="center"
            align="center"
            style={{ height: "calc(100vh - 225px)" }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </Flex>
        ) : (
          <Table
            columns={columns}
            dataSource={
              visibleUser.length < countAll
                ? [
                    ...visibleUser,
                    { id: "more-button-row", isMoreButtonRow: true },
                  ]
                : visibleUser
            }
            pagination={false}
            rowKey="id"
            className="custom-table"
            scroll={{ y: "calc(100vh - 300px)" }}
          />
        )}
        {/* <div className="paginations">
                        {nextPageToken && visibleUser.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div> */}
        {/* </div> */}

        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {t("userdetail")}
            </div>
          }
          open={detailModalOpen}
          onCancel={closeDetailModal}
          footer={null}
          className="modal-content"
        >
          {selectedUserDetail ? (
            <div className="pupil-detail-content">
              <div className="user-detail-section">
                <div className="user-detail-row">
                  <span className="user-detail-label">{t("fullName")}:</span>
                  <span className="user-detail-value">
                    {selectedUserDetail.fullName}
                  </span>
                </div>
                {/* <div className="user-detail-row">
                  <span className="user-detail-label">{t("email")}:</span>
                  <span className="user-detail-value">
                    {selectedUserDetail.email}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">{t("numberPhone")}:</span>
                  <span className="user-detail-value">
                    {selectedUserDetail.phoneNumber}
                  </span>
                </div> */}
                <div className="user-detail-row">
                  <span className="user-detail-label">{t("dateOfBirth")}:</span>
                  <span className="user-detail-value">
                    {formatFirebaseTimestamp(selectedUserDetail.dateOfBirth)}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">{t("address")}:</span>
                  <span className="user-detail-value">
                    {selectedUserDetail.address}
                  </span>
                </div>
                {/* <div className="user-detail-row">
                  <span className="user-detail-label">{t("gender")}:</span>
                  <span className="user-detail-value">
                    {renderGenderIcon(selectedUserDetail.gender)}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">{t("role")}:</span>
                  <span className="user-detail-value">
                    {renderRoleIcon(selectedUserDetail.role)}
                  </span>
                </div> */}
              </div>
              {selectedRole === "user" && (
                <>
                  <h3 style={{ textAlign: "center", fontSize: "24px" }}>
                    {t("pupil")}
                  </h3>
                  {selectedUserDetail.children?.length > 0 ? (
                    <Table
                      columns={pupilColumns}
                      dataSource={selectedUserDetail.children}
                      pagination={false}
                      className="custom-table"
                      scroll={{ y: "250px" }}
                    />
                  ) : (
                    <p>{t("noPupilProfile")}</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <p>{t("noUserData")}</p>
          )}
        </Modal>

        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {t("addAccountUser")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          <div className="form-content">
            <div className="inputtext">
              <label className="titleinput">
                {t("numberPhone")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputNumberPhone")}
                value={edittingUser?.phoneNumber || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...edittingUser,
                    phoneNumber: e.target.value,
                  })
                }
              />
              {errors.phoneNumber && (
                <div className="error-text">{errors.phoneNumber}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("fullName")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputFullName")}
                value={edittingUser?.fullName || ""}
                onChange={(e) =>
                  setEditingUser({ ...edittingUser, fullName: e.target.value })
                }
              />
              {errors.fullName && (
                <div className="error-text">{errors.fullName}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("address")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputAddress")}
                value={edittingUser?.address || ""}
                onChange={(e) =>
                  setEditingUser({ ...edittingUser, address: e.target.value })
                }
              />
              {errors.address && (
                <div className="error-text">{errors.address}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("email")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                type="email"
                placeholder={t("inputEmail")}
                value={edittingUser?.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...edittingUser, email: e.target.value })
                }
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("dateOfBirth")} <span style={{ color: "red" }}>*</span>
              </label>
              <DatePicker
                placeholder={t("inputDateOfBirth")}
                style={{ width: "100%", height: "50px" }}
                defaultValue={moment()}
                value={
                  edittingUser?.dateOfBirth
                    ? moment(edittingUser.dateOfBirth, "YYYY/MM/DD")
                    : null
                }
                onChange={(date) =>
                  setEditingUser({
                    ...edittingUser,
                    dateOfBirth: date ? date.format("YYYY/MM/DD") : "",
                  })
                }
              />
              {errors.dateOfBirth && (
                <div className="error-text">{errors.dateOfBirth}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("gender")} <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                style={{ width: "100%", height: "50px" }}
                placeholder={t("selectionGender")}
                value={edittingUser?.gender || undefined}
                onChange={(value) =>
                  setEditingUser({ ...edittingUser, gender: value })
                }
              >
                <Select.Option value="Male">{t("male")}</Select.Option>
                <Select.Option value="Female">{t("female")}</Select.Option>
              </Select>
              {errors.gender && (
                <div className="error-text">{errors.gender}</div>
              )}
            </div>
          </div>
          <div className="button-row">
            <Button className="cancel-button" onClick={closeModal} block>
              {t("cancel", { ns: "common" })}
            </Button>
            <Button className="save-button" onClick={handleSave} block>
              {t("save", { ns: "common" })}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AccountUser;
