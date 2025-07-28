import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Modal,
  Select,
  Checkbox,
  Breadcrumb,
  Table,
  Pagination,
  Switch,
  Image,
  Flex,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { Imgs } from "../../assets/theme/images";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FaEdit, FaBook, FaInfoCircle, FaPlus } from "react-icons/fa";
import api from "../../assets/api/Api";
import "./exercise.css";
import Navbar from "../../component/Navbar";

const Exercise = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [exercises, setExercises] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filterLevel, setFilterLevel] = useState("all"); // Default to null, will be set to 'easy' after levels load
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [levels, setLevels] = useState([]);
  const [errors, setErrors] = useState("");
  const [lesson, setLesson] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [visibleExercises, setVisibleExercises] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [countAll, setCountAll] = useState("");
  const exercisesPerPage = 5;
  const { Option } = Select;
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["exercise", "common"]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setVisibleExercises(exercises); // Reset to all when search is empty
    } else {
      const filtered = exercises.filter((exercises) =>
        exercises.question?.[i18n.language]
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setVisibleExercises(filtered);
    }
  }, [searchQuery, exercises, i18n.language]);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setExercises([]);
      setVisibleExercises([]);
      setNextPageToken(null);
      try {
        if (filterStatus !== "all" && filterLevel !== "all") {
          await fetchFilterLevelisDisabled(filterLevel, null, filterStatus);
        } else if (filterLevel !== "all" && filterStatus === "all") {
          await fetchFilterLevel(filterLevel, null);
        } else if (filterLevel === "all" && filterStatus !== "all") {
          await fetchAllExercisesisDisabled(null, filterStatus);
        } else {
          await fetchAllExercises(null);
        }
        await fetchLesson();
        await fetchLevels();
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [lessonId, filterStatus, filterLevel]); // Chỉ phụ thuộc vào lessonId

  const fetchAllExercises = async (token = null) => {
    try {
      let url = `/exercise/getByLesson/${lessonId}?pageSize=${exercisesPerPage}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(`/exercise/countByLesson/${lessonId}`);
      setCountAll(Number(responses.data.count));
      const response = await api.get(url);
      const newExercises = response.data.data || [];
      setExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchAllExercisesisDisabled = async (token = null, isDisabled) => {
    try {
      let url = `/exercise/filterByIsDisabled/${lessonId}?pageSize=${exercisesPerPage}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(
        `/exercise/countByLessonAndDisabledStatus/${lessonId}?isDisabled=${isDisabled}`
      );
      setCountAll(Number(responses.data.count));
      const response = await api.get(url);
      const newExercises = response.data.data || [];
      setExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchFilterLevel = async (levelId, token = null) => {
    try {
      console.log("Fetching exercises for levelId:", levelId);
      let url = `/exercise/filterByLevel/${lessonId}/${levelId}?pageSize=${exercisesPerPage}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(
        `/exercise/countByLessonAndLevel/${lessonId}/${levelId}`
      );
      setCountAll(Number(responses.data.count));
      const response = await api.get(url);
      const newExercises = response.data.data || [];
      setExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const fetchFilterLevelisDisabled = async (
    levelId,
    token = null,
    isDisabled
  ) => {
    try {
      console.log("Fetching exercises for levelId:", levelId);
      let url = `/exercise/filterByLevelAndIsDisabled/${lessonId}/${levelId}?pageSize=${exercisesPerPage}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(
        `/exercise/countByLessonAndLevelAndDisabledStatus/${lessonId}/${levelId}?isDisabled=${isDisabled}`
      );
      setCountAll(Number(responses.data.count));
      const response = await api.get(url);
      const newExercises = response.data.data || [];
      setExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleExercises((prev) => {
        const existingIds = new Set(prev.map((exercise) => exercise.id));
        const uniqueNewExercises = newExercises.filter(
          (exercise) => !existingIds.has(exercise.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lesson/${lessonId}`);
      setLesson(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await api.get(`/level/getEnabledLevels`);
      console.log("Levels:", response.data); // Debug API response
      setLevels(response.data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
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
      if (filterStatus !== "all" && filterLevel !== "all") {
        await fetchFilterLevelisDisabled(
          filterLevel,
          nextPageToken,
          filterStatus
        );
      } else if (filterLevel !== "all" && filterStatus === "all") {
        await fetchFilterLevel(filterLevel, nextPageToken);
      } else if (filterLevel === "all" && filterStatus !== "all") {
        await fetchAllExercisesisDisabled(nextPageToken, filterStatus);
      } else {
        await fetchAllExercises(nextPageToken);
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

  const getLevelName = (levelId) => {
    const level = levels.find((lvl) => lvl.id === levelId);
    console.log(levels, level);
    return level ? level.name : levelId;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        const formData = new FormData();
        formData.append("levelId", editingExercise.levelId);
        formData.append("lessonId", lessonId);
        formData.append("question", JSON.stringify(editingExercise.question));
        if (fileList[0]?.originFileObj) {
          formData.append("image", fileList[0].originFileObj);
        }
        const validOptions = editingExercise.option.filter(
          (opt) => opt.vi?.trim() || opt.en?.trim()
        );
        if (validOptions.length > 0) {
          formData.append("option", JSON.stringify(validOptions));
        }
        formData.append("answer", JSON.stringify(editingExercise.answer));

        console.log("Form Data to be sent:");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }

        if (editingExercise.id) {
          await api.put(`/exercise/${editingExercise.id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success(t("updateSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          await api.post(`/exercise`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success(t("addSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        }
        setExercises([]);
        setVisibleExercises([]);
        setNextPageToken(null);
        if (filterStatus !== "all" && filterLevel !== "all") {
          fetchFilterLevelisDisabled(filterLevel, null, filterStatus);
        } else if (filterLevel !== "all" && filterStatus === "all") {
          fetchFilterLevel(filterLevel, null);
        } else if (filterLevel === "all" && filterStatus !== "all") {
          fetchAllExercisesisDisabled(null, filterStatus);
        } else {
          fetchAllExercises(null);
        }
        closeModal();
      } catch (error) {
        console.error("Error saving exercise:", error);
        console.log("Server response:", error.response?.data); // Log chi tiết lỗi từ server
        toast.error(
          error.response?.data?.message?.[i18n.language] ||
            t("saveFailed", { ns: "common" }),
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } else {
      toast.error(t("validationFailed", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleToggleAvailable = async (exercise) => {
    try {
      await api.put(`/exercise/${exercise.id}`, {
        isDisabled: !exercise.isDisabled,
      });
      toast.success(t("updateSuccess", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
      setExercises((prev) =>
        prev.map((e) =>
          e.id === exercise.id ? { ...e, isDisabled: !exercise.isDisabled } : e
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!editingExercise?.levelId || editingExercise.levelId.trim() === "") {
      newErrors.levelId = t("levelIdRequired");
    }
    if (
      !editingExercise?.question?.vi ||
      editingExercise.question.vi.trim() === ""
    ) {
      newErrors.questionVi = t("questionViRequired");
    }
    if (
      !editingExercise?.question?.en ||
      editingExercise.question.en.trim() === ""
    ) {
      newErrors.questionEn = t("questionEnRequired");
    }
    const validOptions = editingExercise?.option?.filter(
      (opt) => opt.vi?.trim() || opt.en?.trim()
    );
    if (!validOptions || validOptions.length === 0) {
      newErrors.option = t("optionRequired");
    }
    if (
      !editingExercise?.answer?.vi ||
      editingExercise.answer.vi.trim() === ""
    ) {
      newErrors.answerVi = t("answerViRequired");
    }
    if (
      !editingExercise?.answer?.en ||
      editingExercise.answer.en.trim() === ""
    ) {
      newErrors.answerEn = t("answerEnRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openModal = (mode, exercise = null) => {
    if (mode === "add") {
      setEditingExercise({
        levelId: "",
        lessonId: lessonId,
        question: { en: "", vi: "" },
        option: [{ vi: "", en: "" }],
        answer: { en: "", vi: "" },
        image: "",
      });
      setImageUrl("");
      setFileList([]);
    } else if (mode === "update") {
      setEditingExercise({
        ...exercise,
        option: exercise.option?.map((otp) =>
          typeof otp === "string" ? { vi: otp, en: otp } : otp
        ) || [{ vi: "", en: "" }],
        answer:
          typeof exercise.answer === "string"
            ? { vi: exercise.answer, en: exercise.answer }
            : exercise.answer || { vi: "", en: "" },
        image: exercise.image || "",
      });
      setImageUrl(exercise.image || "");
      setFileList(exercise.image ? [{ url: exercise.image }] : []);
    }
    setIsModalOpen(true);
  };

  const openDetailModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedExercise(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageUrl("");
    setFileList([]);
    setErrors({});
  };

  const handleImageChange = (info) => {
    const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
    if (fileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(fileObj);
      setFileList([info.fileList[info.fileList.length - 1]]);
    }
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setImageUrl("");
  };

  const addOption = () => {
    if (editingExercise.option.length >= 3) {
      toast.error(t("maxThreeOptions"));
      return;
    }
    setEditingExercise((prev) => ({
      ...prev,
      option: [...prev.option, { vi: "", en: "" }],
    }));
  };

  const removeOption = (index) => {
    if (editingExercise.option.length === 1) {
      toast.error(t("atLeastOneOption"));
      return;
    }
    setEditingExercise((prev) => ({
      ...prev,
      option: prev.option.filter((_, i) => i !== index),
    }));
  };
  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_, record, index) => {
        if (record.isMoreButtonRow && visibleExercises.length < countAll) {
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
    },
    {
      title: t("level"),
      dataIndex: "levelId",
      key: "levelId",
      width: 150,
      align: "center",
      render: (levelId, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        const levelName = getLevelName(levelId);
        return <strong>{levelName?.[i18n.language]}</strong>;
      },
    },
    {
      title: t("question"),
      dataIndex: "question",
      key: "question",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.question?.[i18n.language];
      },
    },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (image, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return image ? (
          <Image
            src={image}
            alt={record.question?.[i18n.language]}
            width={200}
            height={100}
            style={{
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #ccc",
            }}
          />
        ) : (
          "None"
        );
      },
    },
    {
      title: t("action", { ns: "common" }),
      key: "action",
      align: "center",
      width: 270,
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <div className="buttonaction">
            <button
              className="text-white px-3 py-1 buttonupdate"
              onClick={() => openModal("update", record)}
            >
              <Flex justify="center" align="center">
                <FaEdit className="iconupdate" />
                <span>{t("update", { ns: "common" })}</span>
              </Flex>
            </button>
            <button
              className="text-white px-3 py-1 buttondetail"
              onClick={() => openDetailModal(record)}
            >
              <Flex justify="center" align="center">
                <FaInfoCircle className="iconupdate" />
                <span>{t("detail")}</span>
              </Flex>
            </button>
          </div>
        );
      },
    },
    {
      title: t("available", { ns: "common" }),
      dataIndex: "isDisabled",
      key: "isDisabled",
      align: "center",
      width: 120,
      render: (isDisabled, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <Switch
            checked={!isDisabled}
            onChange={() => handleToggleAvailable(record)}
            className="custom-switch"
          />
        );
      },
    },
  ];

  const breadcrumbItems = [
    {
      title: t("lesson"),
      onClick: () => navigate("/lesson"),
      className: "current-breadcrumb-title",
    },
    {
      title: t("managementExercise"),
      className: "current-breadcrumb",
    },
  ];

  return (
    <div className="containers">
      {/* <Navbar /> */}
      {/* <div className="title-search"> */}
      <div>
        <Breadcrumb
          separator=">"
          items={breadcrumbItems}
          style={{ marginTop: 10 }}
        />
        <span className="container-title">
          {lesson?.name?.[i18n.language] || lessonId}
        </span>
      </div>
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
        <div className="flex justify-between items-center mb-2">
          <div className="filter-bar">
            <div className="filter-container">
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
                  value={filterLevel}
                  onChange={(value) => setFilterLevel(value)}
                  placeholder={t("level")}
                >
                  <Select.Option value="all">{t("All Level")}</Select.Option>
                  {levels.map((level) => (
                    <Select.Option key={level.id} value={level.id}>
                      {level.name?.[i18n.language] || level.id}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  className="filter-dropdown"
                  value={filterStatus}
                  onChange={(value) => {
                    setFilterStatus(value);
                  }}
                  placeholder={t("exerciseStatus")}
                  style={{ minWidth: "150px" }}
                >
                  <Select.Option value="all">{t("status")}</Select.Option>
                  <Select.Option value="true">
                    {t("no", { ns: "common" })}
                  </Select.Option>
                  <Select.Option value="false">
                    {t("yes", { ns: "common" })}
                  </Select.Option>
                </Select>
              </div>
            </div>
            <Button className="rounded-add" onClick={() => openModal("add")}>
              <Flex justify="center" align="center" gap="small">
                <FaPlus />
                <span>{t("addNew", { ns: "common" })}</span>
              </Flex>
            </Button>
          </div>
        </div>
        {/* <div className="table-container-exercise"> */}
        {loading ? (
          <Flex
            justify="center"
            align="center"
            style={{ height: "calc(100vh - 255px)" }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </Flex>
        ) : (
          <Table
            columns={columns}
            dataSource={
              visibleExercises.length < countAll
                ? [
                    ...visibleExercises,
                    { id: "more-button-row", isMoreButtonRow: true },
                  ]
                : visibleExercises
            }
            pagination={false}
            rowKey="id"
            className="custom-table"
            scroll={{ y: "calc(100vh - 330px)" }}
          />
        )}
        {/* <div className="paginations">
                        {nextPageToken && visibleExercises.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div> */}
        {/* </div> */}

        <Modal
          title={
            <div
              style={{
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              {t("exercisedetail")}
            </div>
          }
          open={isDetailModalOpen}
          onCancel={closeDetailModal}
          footer={null}
          className="modal-content"
        >
          {selectedExercise && (
            <div className="form-content-assessment-detail">
              <div className="detail-item">
                <label className="detail-label">
                  {t("question")} (Vietnamese)
                </label>
                <div className="detail-content">
                  {selectedExercise.question?.vi || "-"}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">
                  {t("question")} (English)
                </label>
                <div className="detail-content">
                  {selectedExercise.question?.en || "-"}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t("level")}</label>
                <div className="detail-content">
                  {getLevelName(selectedExercise.levelId)?.[i18n.language]}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t("image")}</label>
                <div className="detail-content">
                  {selectedExercise.image ? (
                    <Image
                      src={selectedExercise.image}
                      alt="Assessment"
                      className="assessment-image"
                    />
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t("answer")}</label>
                <div className="detail-content">
                  <span>
                    {selectedExercise.answer?.[i18n.language] ||
                      selectedExercise.answer ||
                      "-"}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t("option")}</label>
                <div className="detail-content option-grid">
                  {selectedExercise.option?.map((opt, index) => (
                    <div key={index}>
                      <span>{opt?.[i18n.language] || otp || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {editingExercise?.id ? t("updateExercise") : t("addExercise")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          <div className="form-content-exercise">
            <div className="inputtext">
              <label className="titleinput">
                {t("question")} (Vietnamese){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputQuestionVi")}
                value={editingExercise?.question?.vi || ""}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    question: {
                      ...editingExercise.question,
                      vi: e.target.value,
                    },
                  })
                }
              />
              {errors.questionVi && (
                <div className="error-text">{errors.questionVi}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("question")} (English){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputQuestionEn")}
                value={editingExercise?.question?.en || ""}
                onChange={(e) =>
                  setEditingExercise({
                    ...editingExercise,
                    question: {
                      ...editingExercise.question,
                      en: e.target.value,
                    },
                  })
                }
              />
              {errors.questionEn && (
                <div className="error-text">{errors.questionEn}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">{t("image")}</label>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                fileList={fileList}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="custom-upload-button"
                >
                  {t("inputImage")}
                </Button>
              </Upload>
              {imageUrl && (
                <div className="image-preview-box">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    className="preview-image"
                  />
                  <DeleteOutlined
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 20,
                      color: "#ff4d4f",
                      cursor: "pointer",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: 4,
                    }}
                  />
                </div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("level")} <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                style={{ width: "100%", height: "50px" }}
                placeholder={t("selectLevelId")}
                value={editingExercise?.levelId || null}
                onChange={(value) =>
                  setEditingExercise({
                    ...editingExercise,
                    levelId: value,
                  })
                }
              >
                {levels.map((level) => (
                  <Select.Option key={level.id} value={level.id}>
                    {level.name?.[i18n.language] || level.id}
                  </Select.Option>
                ))}
              </Select>
              {errors.levelId && (
                <div className="error-text">{errors.levelId}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("answer")} <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <Input
                  placeholder={t("inputAnswerVi")}
                  value={editingExercise?.answer?.vi || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      answer: {
                        ...editingExercise.answer,
                        vi: e.target.value,
                      },
                    })
                  }
                  style={{ flex: 1 }}
                />

                <Input
                  placeholder={t("inputAnswerEn")}
                  value={editingExercise?.answer?.en || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      answer: {
                        ...editingExercise.answer,
                        en: e.target.value,
                      },
                    })
                  }
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: "flex", gap: "85px" }}>
                {errors.answerVi && (
                  <div className="error-text">{errors.answerVi}</div>
                )}
                {errors.answerEn && (
                  <div className="error-text">{errors.answerEn}</div>
                )}
              </div>
            </div>

            <div className="inputtext">
              <label className="titleinput">
                {t("option")} <span style={{ color: "red" }}>*</span>
              </label>
              {editingExercise?.option?.map((opt, index) => (
                <div
                  key={index}
                  className="option-text"
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "10px",
                    position: "relative",
                  }}
                >
                  <Input
                    placeholder={`${t("option")} ${index + 1} (VietNamese)`}
                    value={opt?.vi || ""}
                    onChange={(e) => {
                      const newOptions = [...editingExercise.option];
                      newOptions[index] = {
                        ...newOptions[index],
                        vi: e.target.value,
                      };
                      setEditingExercise({
                        ...editingExercise,
                        option: newOptions,
                      });
                    }}
                    style={{ flex: 1 }}
                  />
                  <Input
                    placeholder={`${t("option")} ${index + 1} (English)`}
                    value={opt?.en || ""}
                    onChange={(e) => {
                      const newOptions = [...editingExercise.option];
                      newOptions[index] = {
                        ...newOptions[index],
                        en: e.target.value,
                      };
                      setEditingExercise({
                        ...editingExercise,
                        option: newOptions,
                      });
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    onClick={() => removeOption(index)}
                    icon={<DeleteOutlined />}
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "20",
                      color: "#ff4d4f",
                      cursor: "pointer",
                      background: "white",
                      borderRadius: "50%",
                      height: "60%",
                    }}
                  />
                </div>
              ))}
              <Button
                onClick={addOption}
                style={{ marginTop: "10px" }}
                className="custom-upload-button"
              >
                + {t("addOption")}
              </Button>
              {errors.option && (
                <div className="error-text">{errors.option}</div>
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

export default Exercise;
