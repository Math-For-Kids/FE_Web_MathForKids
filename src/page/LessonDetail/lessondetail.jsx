import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Modal,
  Select,
  Image,
  Breadcrumb,
  Table,
  Switch,
  Flex,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaEdit, FaPlus } from "react-icons/fa";
import { Upload } from "antd";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../assets/api/Api";
import "./lessonDetail.css";
import Navbar from "../../component/Navbar";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DOMPurify from "dompurify";

const LessonDetail = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonDetail, setEditingLessonDetail] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [lessonDetails, setLessonDetails] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [errors, setErrors] = useState({});
  const [creationMode, setCreationMode] = useState("single"); // 'single' or 'full'
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleLessonDetail, setVisibleLessonDetail] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [countAll, setCountAll] = useState("");
  const [countAllLD, setCountAllLD] = useState("");
  const [editorKey, setEditorKey] = useState(0); // Added to force CKEditor re-mount
  const pageSize = 20;
  const { t, i18n } = useTranslation(["lessondetail", "common"]);
  const navigate = useNavigate();
  const { lessonId } = useParams();

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setVisibleLessonDetail(lessonDetails);
    } else {
      const filtered = lessonDetails.filter(
        (lesson) =>
          lesson.title?.[i18n.language]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lesson.content?.[i18n.language]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setVisibleLessonDetail(filtered);
    }
  }, [searchQuery, lessonDetails, i18n.language]);

  // Fetch lesson details and lesson
  useEffect(() => {
    const fetchLessonDetails = async () => {
      setLoading(true);
      setLessonDetails([]);
      setVisibleLessonDetail([]);
      setNextPageToken(null);
      try {
        if (filterStatus !== "all") {
          await fetchFilterLessonDetailDisabled(null, filterStatus);
        } else {
          await fetchAllLessonDetails(null);
        }
        await fetchLesson();

        setTimeout(() => setLoading(false), 0);
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchLessonDetails();
  }, [lessonId, filterStatus]);

  const fetchAllLessonDetails = async (token = null) => {
    try {
      let url = `/lessondetail/getByLesson/${lessonId}?pageSize=${pageSize}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(
        `/lessondetail/countByLesson/${lessonId}`
      );
      setCountAll(Number(responses.data.count));
      setCountAllLD(Number(responses.data.count));
      const response = await api.get(url);
      const newLessons = response.data.data || [];
      setLessonDetails((prev) => {
        const existingIds = new Set(prev.map((lesson) => lesson.id));
        const uniqueNewLessons = newLessons.filter(
          (lesson) => !existingIds.has(lesson.id)
        );
        return [...prev, ...uniqueNewLessons];
      });
      setVisibleLessonDetail((prev) => {
        const existingIds = new Set(prev.map((lesson) => lesson.id));
        const uniqueNewLessons = newLessons.filter(
          (lesson) => !existingIds.has(lesson.id)
        );
        return [...prev, ...uniqueNewLessons];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchFilterLessonDetailDisabled = async (token = null, isDisabled) => {
    try {
      let url = `/lessondetail/filtergetByLesson/${lessonId}?pageSize=${pageSize}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const responses = await api.get(
        `/lessondetail/countByLessonAndDisabledState/${lessonId}?isDisabled=${isDisabled}`
      );
      setCountAll(Number(responses.data.count));
      const response = await api.get(url);
      const newLessons = response.data.data || [];
      setLessonDetails((prev) => {
        const existingIds = new Set(prev.map((lesson) => lesson.id));
        const uniqueNewLessons = newLessons.filter(
          (lesson) => !existingIds.has(lesson.id)
        );
        return [...prev, ...uniqueNewLessons];
      });
      setVisibleLessonDetail((prev) => {
        const existingIds = new Set(prev.map((lesson) => lesson.id));
        const uniqueNewLessons = newLessons.filter(
          (lesson) => !existingIds.has(lesson.id)
        );
        return [...prev, ...uniqueNewLessons];
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
    try {
      if (filterStatus !== "all") {
        await fetchFilterLessonDetailDisabled(nextPageToken, filterStatus);
      } else {
        await fetchAllLessonDetails(nextPageToken);
      }
    } catch (error) {
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

  const Validation = (data) => {
    const newErrors = {};
    if (!data?.order || isNaN(data.order) || data.order < 1) {
      newErrors.order = t("orderRequired");
    }
    if (!data?.title?.vi || data.title.vi.trim() === "") {
      newErrors.title = t("titleRequired");
    }
    const viContent = data?.content?.vi
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!viContent || viContent === "") {
      newErrors.contentVi = t("contentViRequired");
    }
    const enContent = data?.content?.en
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!enContent || enContent === "") {
      newErrors.contentEn = t("contentEnRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const ValidationFullLesson = (data) => {
    const newErrors = {};
    const defineVi = data?.contents?.define?.vi
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!defineVi || defineVi === "") {
      newErrors.defineVi = t("contentViRequired");
    }
    const defineEn = data?.contents?.define?.en
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!defineEn || defineEn === "") {
      newErrors.defineEn = t("contentEnRequired");
    }
    const exampleVi = data?.contents?.example?.vi
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!exampleVi || exampleVi === "") {
      newErrors.exampleVi = t("contentViRequired");
    }
    const exampleEn = data?.contents?.example?.en
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!exampleEn || exampleEn === "") {
      newErrors.exampleEn = t("contentEnRequired");
    }
    const rememberVi = data?.contents?.remember?.vi
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!rememberVi || rememberVi === "") {
      newErrors.rememberVi = t("contentViRequired");
    }
    const rememberEn = data?.contents?.remember?.en
      ?.replace(/<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g, "")
      .trim();
    if (!rememberEn || rememberEn === "") {
      newErrors.rememberEn = t("contentEnRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (creationMode === "single") {
      if (Validation(editingLessonDetail)) {
        try {
          const formData = new FormData();
          formData.append("lessonId", editingLessonDetail.lessonId);
          formData.append("order", editingLessonDetail.order);
          formData.append("title", JSON.stringify(editingLessonDetail.title));
          formData.append(
            "content",
            JSON.stringify(editingLessonDetail.content)
          );

          if (fileList[0]?.originFileObj) {
            formData.append("image", fileList[0].originFileObj);
          }

          if (editingLessonDetail.id) {
            await api.put(`/lessondetail/${editingLessonDetail.id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(t("updateSuccess", { ns: "common" }));
          } else {
            await api.post(`/lessondetail`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(t("addSuccess", { ns: "common" }));
          }
          setLessonDetails([]);
          setVisibleLessonDetail([]);
          setNextPageToken(null);
          if (filterStatus !== "all") {
            await fetchFilterLessonDetailDisabled(null, filterStatus);
          } else {
            await fetchAllLessonDetails(null);
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
          autoClose: 3000,
        });
      }
    } else if (creationMode === "full") {
      if (ValidationFullLesson(editingLessonDetail)) {
        try {
          const formData = new FormData();
          formData.append("lessonId", editingLessonDetail.lessonId);
          formData.append(
            "contents",
            JSON.stringify(editingLessonDetail.contents)
          );
          if (fileList.define?.[0]?.originFileObj) {
            formData.append("define", fileList.define[0].originFileObj);
          }
          if (fileList.example?.[0]?.originFileObj) {
            formData.append("example", fileList.example[0].originFileObj);
          }
          if (fileList.remember?.[0]?.originFileObj) {
            formData.append("remember", fileList.remember[0].originFileObj);
          }
          await api.post(`/lessondetail/full`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success(t("addFullLessonSuccess", { ns: "common" }));
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
          autoClose: 3000,
        });
      }
    }
  };

  const openModal = (mode, lessonDetail = null) => {
    if (mode === "add") {
      setCreationMode("single");
      const maxOrder =
        lessonDetails.length > 0
          ? Math.max(...lessonDetails.map((ld) => ld.order))
          : 0;
      setEditingLessonDetail({
        lessonId: lessonId || "",
        order: maxOrder + 1,
        title: { en: "", vi: "" },
        content: { en: "", vi: "" },
        image: null,
      });
      setImageUrl("");
      setFileList([]);
    } else if (mode === "addFull") {
      setCreationMode("full");
      setEditingLessonDetail({
        lessonId: lessonId || "",
        contents: {
          define: { vi: "", en: "" },
          example: { vi: "", en: "" },
          remember: { vi: "", en: "" },
        },
        images: { define: null, example: null, remember: null },
      });
      setImageUrl("");
      setFileList({ define: [], example: [], remember: [] });
    } else if (mode === "update") {
      setCreationMode("single");
      setEditingLessonDetail({
        ...lessonDetail,
        title: lessonDetail.title || { en: "", vi: "" },
        content: lessonDetail.content || { en: "", vi: "" },
        image: lessonDetail.image || null,
      });
      setImageUrl(lessonDetail.image || "");
      setFileList(
        lessonDetail.image
          ? [
              {
                uid: "-1",
                name: "image",
                status: "done",
                url: lessonDetail.image,
              },
            ]
          : []
      );
      setEditorKey((prev) => prev + 1); // Force CKEditor re-mount
    }
    setIsModalOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLessonDetail(null);
    setImageUrl("");
    setFileList([]);
    setErrors({});
    setCreationMode("single");
    setEditorKey((prev) => prev + 1); // Reset editorKey for next modal open
  };

  const handleTitleChange = (value) => {
    setEditingLessonDetail({
      ...editingLessonDetail,
      title: { en: value, vi: value },
    });
  };

  const handleImageChange = (info, section = null) => {
    const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
    if (fileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (creationMode === "single") {
          setImageUrl(e.target.result);
          setFileList([
            {
              ...info.fileList[info.fileList.length - 1],
              url: e.target.result,
            },
          ]);
        } else if (creationMode === "full") {
          setFileList((prev) => ({
            ...prev,
            [section]: [
              {
                ...info.fileList[info.fileList.length - 1],
                url: e.target.result,
              },
            ],
          }));
        }
      };
      reader.readAsDataURL(fileObj);
    }
  };

  const handleToggleAvailable = async (lessonDetail) => {
    try {
      await api.put(`/lessondetail/${lessonDetail.id}`, {
        isDisabled: !lessonDetail.isDisabled,
      });
      toast.success(t("updateSuccess", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
      setLessonDetails((prev) =>
        prev.map((e) =>
          e.id === lessonDetail.id
            ? { ...e, isDisabled: !lessonDetail.isDisabled }
            : e
        )
      );
      setVisibleLessonDetail((prev) =>
        prev.map((e) =>
          e.id === lessonDetail.id
            ? { ...e, isDisabled: !lessonDetail.isDisabled }
            : e
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setImageUrl(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const breadcrumbItems = [
    {
      // href: '',
      title: t("lesson"),
      onClick: () => navigate("/lesson"),
      className: "current-breadcrumb-title",
    },
    {
      title: t("managementLessonDetail"),
      className: "current-breadcrumb",
    },
  ];

  const columns = [
    {
      title: t(".no"),
      dataIndex: "order",
      key: "order",
      width: 100,
    },
    {
      title: t("title"),
      dataIndex: "title",
      key: "title",
      render: (title) => title?.[i18n.language] || "",
    },
    {
      title: t("content"),
      dataIndex: "content",
      key: "content",
      render: (content) => {
        const htmlContent =
          content?.[i18n.language] || content?.en || content?.vi || "";
        return (
          <div className="content-wrapper">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(htmlContent),
              }}
            />
          </div>
        );
      },
    },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (image, record) =>
        image ? (
          <Image
            src={image}
            alt={record.title?.[i18n.language]}
            width={150}
            height={150}
            style={{
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #ccc",
            }}
          />
        ) : (
          <span>{t("image")}</span>
        ),
    },
    {
      title: t("action", { ns: "common" }),
      key: "action",
      align: "center",
      render: (_, record) => (
        <button
          className="text-white px-3 py-1 buttonupdate"
          onClick={() => openModal("update", record)}
        >
          <Flex justify="center" align="center">
            <FaEdit className="iconupdate" />
            <span>{t("update", { ns: "common" })}</span>
          </Flex>
        </button>
      ),
    },
    {
      title: t("available", { ns: "common" }),
      dataIndex: "isDisabled",
      key: "isDisabled",
      align: "center",
      render: (isDisabled, record) => (
        <Switch
          checked={!isDisabled}
          onChange={() => handleToggleAvailable(record)}
          className="custom-switch"
        />
      ),
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div> */}
      <div className="containers-content">
        <div className="filter-bar mb-2">
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
              onChange={(value) => setFilterStatus(value)}
              placeholder={t("lessonStatus")}
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
          <div>
            {/* <Button className="rounded-add" onClick={() => openModal("add")}>
              + {t("addNew", { ns: "common" })}
            </Button> */}
            {countAllLD == 0 && (
              <Button
                className="rounded-add"
                onClick={() => openModal("addFull")}
              >
                <Flex justify="center" align="center" gap="small">
                  <FaPlus />
                  <span>{t("addFullLesson")}</span>
                </Flex>
              </Button>
            )}
          </div>
        </div>
        {/* <div className="table-container-lessondetail"> */}
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
            dataSource={visibleLessonDetail}
            pagination={false}
            rowKey="id"
            className="custom-table"
            scroll={{ y: "calc(100vh - 330px)" }}
          />
        )}
        {/* <div className="paginations">
                        {nextPageToken && visibleLessonDetail.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div> */}
        {/* </div> */}
        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {editingLessonDetail?.id
                ? t("updateLessonDetail")
                : creationMode === "single"
                ? t("addLessonDetail")
                : t("addFullLesson")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          {creationMode === "single" ? (
            <div className="form-content-lesson">
              <div className="inputtext">
                <label className="titleinput">
                  {t("order")} <span style={{ color: "red" }}>*</span>
                </label>
                <Input
                  type="number"
                  placeholder={t("inputOrder")}
                  value={editingLessonDetail?.order || ""}
                  onChange={(e) =>
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                />
                {errors.order && (
                  <div className="error-text">{errors.order}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">
                  {t("title")} <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  placeholder={t("selectTitle")}
                  value={editingLessonDetail?.title?.en || null}
                  onChange={handleTitleChange}
                  style={{ width: "100%", height: "50px" }}
                >
                  <Select.Option value="Define">
                    {t("defineSection")}
                  </Select.Option>
                  <Select.Option value="Example">
                    {t("exampleSection")}
                  </Select.Option>
                  <Select.Option value="Remember">
                    {t("rememberSection")}
                  </Select.Option>
                </Select>
                {errors.title && (
                  <div className="error-text">{errors.title}</div>
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
                  {t("content")} (Vietnamese){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`vi-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.content?.vi?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      content: {
                        ...editingLessonDetail.content,
                        vi: wrappedData,
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.contentVi && (
                  <div className="error-text">{errors.contentVi}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (English){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`en-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.content?.en?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      content: {
                        ...editingLessonDetail.content,
                        en: wrappedData,
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.contentEn && (
                  <div className="error-text">{errors.contentEn}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="form-content-lesson">
              <h4 style={{ marginTop: "15px", textAlign: "center" }}>
                {t("defineSection")}
              </h4>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (Vietnamese){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`define-vi-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.define?.vi?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        define: {
                          ...editingLessonDetail.contents.define,
                          vi: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.defineVi && (
                  <div className="error-text">{errors.defineVi}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (English){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`define-en-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.define?.en?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        define: {
                          ...editingLessonDetail.contents.define,
                          en: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.defineEn && (
                  <div className="error-text">{errors.defineEn}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">{t("image")}</label>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={(info) => handleImageChange(info, "define")}
                  fileList={fileList.define}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="custom-upload-button"
                  >
                    {t("inputImage")}
                  </Button>
                </Upload>
                {fileList.define?.[0]?.url && (
                  <div className="image-preview-box">
                    <Image
                      src={fileList.define[0].url}
                      alt="Define Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              <h4 style={{ marginTop: "15px", textAlign: "center" }}>
                {t("exampleSection")}
              </h4>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (Vietnamese){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`example-vi-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.example?.vi?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        example: {
                          ...editingLessonDetail.contents.example,
                          vi: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.exampleVi && (
                  <div className="error-text">{errors.exampleVi}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (English){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`example-en-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.example?.en?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        example: {
                          ...editingLessonDetail.contents.example,
                          en: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.exampleEn && (
                  <div className="error-text">{errors.exampleEn}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">{t("image")}</label>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={(info) => handleImageChange(info, "example")}
                  fileList={fileList.example}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="custom-upload-button"
                  >
                    {t("inputImage")}
                  </Button>
                </Upload>
                {fileList.example?.[0]?.url && (
                  <div className="image-preview-box">
                    <Image
                      src={fileList.example[0].url}
                      alt="Example Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              <h4 style={{ marginTop: "15px", textAlign: "center" }}>
                {t("rememberSection")}
              </h4>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (Vietnamese){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`remember-vi-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.remember?.vi?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        remember: {
                          ...editingLessonDetail.contents.remember,
                          vi: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.rememberVi && (
                  <div className="error-text">{errors.rememberVi}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">
                  {t("content")} (English){" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <CKEditor
                  key={`remember-en-editor-${editorKey}`}
                  editor={ClassicEditor}
                  data={
                    editingLessonDetail?.contents?.remember?.en?.replace(
                      /<div style="font-size: 18px; line-height: 1.5;">|<\/div>/g,
                      ""
                    ) || ""
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const wrappedData = `<div style="font-size: 18px; line-height: 1.5;">${data}</div>`;
                    setEditingLessonDetail({
                      ...editingLessonDetail,
                      contents: {
                        ...editingLessonDetail.contents,
                        remember: {
                          ...editingLessonDetail.contents.remember,
                          en: wrappedData,
                        },
                      },
                    });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
                {errors.rememberEn && (
                  <div className="error-text">{errors.rememberEn}</div>
                )}
              </div>
              <div className="inputtext">
                <label className="titleinput">{t("image")}</label>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={(info) => handleImageChange(info, "remember")}
                  fileList={fileList.remember}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="custom-upload-button"
                  >
                    {t("inputImage")}
                  </Button>
                </Upload>
                {fileList.remember?.[0]?.url && (
                  <div className="image-preview-box">
                    <Image
                      src={fileList.remember[0].url}
                      alt="Remember Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
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

export default LessonDetail;
