import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Select,
  Modal,
  DatePicker,
  Table,
  Pagination,
  Switch,
  Flex,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  FaMars,
  FaVenus,
  FaCrown,
  FaGraduationCap,
  FaUsers,
  FaUserGraduate,
  FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Navbar from "../../component/Navbar";
import api from "../../assets/api/Api";
import "./pupil.css";

const PupilManagement = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPupil, setEditingPupil] = useState(null);
  const [pupilsData, setPupilsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [parentMap, setParentMap] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [countAll, setCountAll] = useState("");
  const [visiblePupil, setVisiblePupil] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const pupilsPerPage = 10;

  const { t } = useTranslation(["pupil", "common"]);
  const { Option } = Select;

  useEffect(() => {
    const fetchPupils = async () => {
      setLoading(true);
      try {
        setVisiblePupil([]);
        setPupilsData([]);
        setNextPageToken(null);
        if (filterStatus !== "all") {
          await fetchPupilByisDesabled(null, filterStatus);
        } else {
          await fetchAllData(null);
        }
        await fetchAllParents(null);

        setTimeout(() => setLoading(false), 0);
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchPupils();
  }, [filterStatus]);

  const fetchAllData = async (token = null) => {
    try {
      let url = `/pupil?pageSize=${pupilsPerPage}`;
      if (token) {
        url += `&startAfterId=${token}`; // Use startAfterId as per your backend
      }
      const response = await api.get(url);
      const newPupils = response.data.data || [];
      const responses = await api.get(`/pupil/countAll`);
      setCountAll(responses.data.count);
      setPupilsData((prev) => {
        const existingIds = new Set(prev.map((pupil) => pupil.id));
        const uniqueNewExercises = newPupils.filter(
          (pupil) => !existingIds.has(pupil.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisiblePupil((prev) => {
        const existingIds = new Set(prev.map((pupil) => pupil.id));
        const uniqueNewExercises = newPupils.filter(
          (pupil) => !existingIds.has(pupil.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchAllParents = async (token = null) => {
    try {
      let url = `/user?pageSize=1000`;
      if (token) {
        url += `&startAfterId=${token}`;
      }

      const response = await api.get(url);
      const newParents = response.data.data || [];
      console.log("Fetched parents:", newParents); // Debug: Log parent data
      setUsersData((prev) => {
        const existingIds = new Set(prev.map((parent) => parent.id));
        const uniqueNewParents = newParents.filter(
          (parent) => !existingIds.has(parent.id)
        );
        return [...prev, ...uniqueNewParents];
      });
      setParentMap((prev) => {
        const updatedMap = { ...prev };
        newParents.forEach((parent) => {
          updatedMap[parent.id] = parent.fullName || parent.name || "Unknown";
        });
        return updatedMap;
      });
      //   setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchPupilByisDesabled = async (token = null, isDisabled) => {
    console.log(isDisabled);
    try {
      let url = `/pupil/filterByDisabledStatus?pageSize=${pupilsPerPage}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`; // Use startAfterId as per your backend
      }
      const response = await api.get(url);
      const newPupils = response.data.data || [];
      const responses = await api.get(
        `/pupil/countByDisabledStatus?isDisabled=${isDisabled}`
      );
      setCountAll(responses.data.count);
      setPupilsData((prev) => {
        const existingIds = new Set(prev.map((pupil) => pupil.id));
        const uniqueNewExercises = newPupils.filter(
          (pupil) => !existingIds.has(pupil.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisiblePupil((prev) => {
        const existingIds = new Set(prev.map((pupil) => pupil.id));
        const uniqueNewExercises = newPupils.filter(
          (pupil) => !existingIds.has(pupil.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const loadMore = async () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      if (filterStatus !== "all") {
        await fetchPupilByisDesabled(nextPageToken, filterStatus);
      } else {
        await fetchAllData(nextPageToken);
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
  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openModal = (mode, pupil = null) => {
    if (mode === "add") {
      setEditingPupil({
        fullName: "",
        nickName: "",
        gender: undefined,
        userId: undefined,
        dateOfBirth: null,
        grade: undefined,
        isDisabled: false,
      });
    } else if (mode === "update" && pupil) {
      let formattedDOB = "";
      if (pupil.dateOfBirth?.seconds) {
        formattedDOB = moment(pupil.dateOfBirth.seconds * 1000).format(
          "YYYY/MM/DD"
        );
      } else if (typeof pupil.dateOfBirth === "string") {
        formattedDOB = moment(pupil.dateOfBirth).isValid()
          ? moment(pupil.dateOfBirth).format("YYYY/MM/DD")
          : "";
      }
      setEditingPupil({ ...pupil, dateOfBirth: formattedDOB });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPupil(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editingPupil?.fullName?.trim())
      newErrors.fullName = t("fullNameRequired");
    if (!editingPupil?.nickName?.trim())
      newErrors.nickName = t("nickNameRequired");
    if (!editingPupil?.gender) newErrors.gender = t("genderRequired");
    if (!editingPupil?.userId) newErrors.userId = t("parentRequired");
    if (!editingPupil?.dateOfBirth)
      newErrors.dateOfBirth = t("dateOfBirthRequired");
    if (!editingPupil?.grade) newErrors.grade = t("gradeRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        if (editingPupil?.id) {
          await api.put(`/pupil/${editingPupil.id}`, editingPupil);
          toast.success(t("updateSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          await api.post("/pupil", editingPupil);
          toast.success(t("addSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        }
        closeModal();
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      toast.error(t("validationFailed", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleToggleDisabled = async (pupil) => {
    try {
      await api.patch(`/pupil/updateProfile/${pupil.id}`, {
        isDisabled: !pupil.isDisabled,
      });
      setVisiblePupil((prev) =>
        prev.map((e) =>
          e.id === pupil.id ? { ...e, isDisabled: !pupil.isDisabled } : e
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
  const renderGenderIcon = (gender) => {
    if (gender.toLowerCase() === "male") {
      return <FaMars className="gender-icon" style={{ color: "#35A6FF" }} />;
    } else if (gender.toLowerCase() === "female") {
      return <FaVenus className="gender-icon" style={{ color: "#FF1493" }} />;
    }
    return null;
  };
  // Ant Design Table columns
  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, record, index) => {
        if (record.isMoreButtonRow && visiblePupil.length < countAll) {
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
    },
    {
      title: t("nickName"),
      dataIndex: "nickName",
      key: "nickName",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.nickName;
      },
    },
    {
      title: t("parentName"),
      dataIndex: "userId", // Change to the correct field name
      key: "parentName",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return parentMap[record.userId] || "Unknown";
      },
    },
    {
      title: t("gender"),
      dataIndex: "gender",
      key: "gender",
      // width: 100,
      align: "center",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return renderGenderIcon(record.gender);
      },
    },
    {
      title: t("dateOfBirth"),
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      // width: "120px",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return formatFirebaseTimestamp(record.dateOfBirth);
      },
      align: "center",
    },
    // {
    //     title: t('action', { ns: 'common' }),
    //     key: 'action',
    //     align: 'center',
    //     render: (_, record) => (
    //         <button
    //             className="text-white px-3 py-1 buttonupdate"
    //             onClick={() => openModal('update', record)}
    //         >
    //             <FaEdit className="iconupdate" />
    //             {t('update', { ns: 'common' })}
    //         </button>
    //     ),
    // },
    {
      title: t("available", { ns: "common" }),
      dataIndex: "isDisabled",
      key: "isDisabled",
      align: "center",
      width: "120px",
      render: (isDisabled, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <Switch
            checked={!isDisabled}
            onChange={() => handleToggleDisabled(record)}
            className="custom-switch"
          />
        );
      },
    },
  ];

  return (
    <div className="containers">
      {/* <Navbar /> */}
      {/* <div className="title-search"> */}
      <h1 className="container-title">{t("managementLessons")}</h1>
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
                </div>
            </div> */}
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
          {/* <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button> */}
        </div>
        {/* <div className="table-container-pupil"> */}
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
              visiblePupil.length < countAll
                ? [
                    ...visiblePupil,
                    { id: "more-button-row", isMoreButtonRow: true },
                  ]
                : visiblePupil
            }
            pagination={false}
            rowKey="id"
            className="custom-table"
            scroll={{ y: "calc(100vh - 300px)" }}
          />
        )}
        {/* <div className="paginations">
                        {nextPageToken && visiblePupil.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div> */}
        {/* </div> */}

        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {editingPupil?.id ? t("updatePupil") : t("addPupil")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          <div className="form-content-pupil">
            <div className="inputtext">
              <label className="titleinput">
                {t("fullName")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("fullName")}
                value={editingPupil?.fullName || ""}
                onChange={(e) =>
                  setEditingPupil({ ...editingPupil, fullName: e.target.value })
                }
              />
              {errors.fullName && (
                <div className="error-text">{errors.fullName}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("nickName")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("nickName")}
                value={editingPupil?.nickName || ""}
                onChange={(e) =>
                  setEditingPupil({ ...editingPupil, nickName: e.target.value })
                }
              />
              {errors.nickName && (
                <div className="error-text">{errors.nickName}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("gender")} <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                style={{ width: "100%", height: "50px" }}
                placeholder="Select gender"
                value={editingPupil?.gender || undefined}
                onChange={(value) =>
                  setEditingPupil({ ...editingPupil, gender: value })
                }
              >
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
              </Select>
              {errors.gender && (
                <div className="error-text">{errors.gender}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("parentName")} <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                style={{ width: "100%", height: "50px" }}
                placeholder={t("selectParent")}
                value={editingPupil?.userId || undefined}
                onChange={(value) =>
                  setEditingPupil({ ...editingPupil, userId: value })
                }
              >
                {usersData.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.fullName}
                  </Select.Option>
                ))}
              </Select>
              {errors.userId && (
                <div className="error-text">{errors.userId}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("dateOfBirth")} <span style={{ color: "red" }}>*</span>
              </label>
              <DatePicker
                style={{ width: "100%", height: "50px" }}
                value={
                  editingPupil?.dateOfBirth
                    ? moment(editingPupil.dateOfBirth, "YYYY/MM/DD")
                    : null
                }
                onChange={(date) =>
                  setEditingPupil({
                    ...editingPupil,
                    dateOfBirth: date ? date.format("YYYY/MM/DD") : null,
                  })
                }
              />
              {errors.dateOfBirth && (
                <div className="error-text">{errors.dateOfBirth}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("grade")} <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                style={{ width: "100%", height: "50px" }}
                placeholder="Select grade"
                value={editingPupil?.grade || undefined}
                onChange={(value) =>
                  setEditingPupil({ ...editingPupil, grade: value })
                }
              >
                <Select.Option value="1">1</Select.Option>
                <Select.Option value="2">2</Select.Option>
                <Select.Option value="3">3</Select.Option>
              </Select>
              {errors.grade && <div className="error-text">{errors.grade}</div>}
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

export default PupilManagement;
