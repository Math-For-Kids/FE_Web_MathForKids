import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Modal,
  Table,
  Pagination,
  Switch,
  Image,
  message,
  Select,
  Flex,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { FaEdit, FaPlus } from "react-icons/fa";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { Imgs } from "../../assets/theme/images";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../assets/api/Api";
import "./reward.css";
import Navbar from "../../component/Navbar";

const Rewards = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [rewards, setRewards] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [countAll, setCountAll] = useState("");
  const [visibleReward, setVisibleReward] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const rewardsPerPage = 10;
  const { t, i18n } = useTranslation(["reward", "common"]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setVisibleReward(rewards); // Reset to all when search is empty
    } else {
      const filtered = rewards.filter((reward) =>
        reward.name?.[i18n.language]
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setVisibleReward(filtered);
    }
  }, [searchQuery, rewards, i18n.language]);

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      try {
        setVisibleReward([]);
        setRewards([]);
        setNextPageToken(null);
        if (filterStatus !== "all") {
          await fetchRewardsByDisabled(null, filterStatus);
        } else {
          await fetchAllRewards(null);
        }

        setTimeout(() => setLoading(false), 0);
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchRewards();
  }, [filterStatus]);

  const fetchAllRewards = async (token = null) => {
    try {
      let url = `/reward?pageSize=${rewardsPerPage}`;
      if (token) {
        url += `&startAfterId=${token}`; // Use startAfterId as per your backend
      }
      const response = await api.get(url);
      const newRewards = response.data.data || [];
      const responses = await api.get(`/reward/countAll`);
      setCountAll(Number(responses.data.count));
      setRewards((prev) => {
        const existingIds = new Set(prev.map((reward) => reward.id));
        const uniqueNewExercises = newRewards.filter(
          (reward) => !existingIds.has(reward.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleReward((prev) => {
        const existingIds = new Set(prev.map((reward) => reward.id));
        const uniqueNewExercises = newRewards.filter(
          (reward) => !existingIds.has(reward.id)
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
  const fetchRewardsByDisabled = async (token = null, isDisabled) => {
    try {
      let url = `/reward/filterByDisabledStatus?pageSize=${rewardsPerPage}&isDisabled=${isDisabled}`;
      if (token) {
        url += `&startAfterId=${token}`; // Use startAfterId as per your backend
      }
      const response = await api.get(url);
      const newRewards = response.data.data || [];
      const responses = await api.get(
        `/reward/countByDisabledStatus?isDisabled=${isDisabled}`
      );
      setCountAll(Number(responses.data.count));
      setRewards((prev) => {
        const existingIds = new Set(prev.map((reward) => reward.id));
        const uniqueNewExercises = newRewards.filter(
          (reward) => !existingIds.has(reward.id)
        );
        return [...prev, ...uniqueNewExercises];
      });
      setVisibleReward((prev) => {
        const existingIds = new Set(prev.map((reward) => reward.id));
        const uniqueNewExercises = newRewards.filter(
          (reward) => !existingIds.has(reward.id)
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
        await fetchRewardsByDisabled(nextPageToken, filterStatus);
      } else {
        await fetchAllRewards(nextPageToken);
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
    if (validate()) {
      try {
        const formData = new FormData();
        formData.append("name", JSON.stringify(editingReward.name));
        formData.append(
          "description",
          JSON.stringify(editingReward.description)
        );
        formData.append("exchangePoint", Number(editingReward.exchangePoint));

        if (fileList[0]?.originFileObj) {
          formData.append("image", fileList[0].originFileObj);
        }
        if (editingReward.id) {
          await api.patch(`/reward/${editingReward.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success(t("updateSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          await api.post(`/reward`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success(t("addSuccess", { ns: "common" }), {
            position: "top-right",
            autoClose: 2000,
          });
        }
        setVisibleReward([]);
        setRewards([]);
        setNextPageToken(null);
        if (filterStatus !== "all") {
          await fetchRewardsByDisabled(null, filterStatus);
        } else {
          await fetchAllRewards(null);
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

  const handleToggleAvailable = async (reward) => {
    try {
      await api.patch(`/reward/${reward.id}`, {
        isDisabled: !reward.isDisabled,
      });
      toast.success(t("updateSuccess", { ns: "common" }), {
        position: "top-right",
        autoClose: 2000,
      });
      setRewards((prev) =>
        prev.map((e) =>
          e.id === reward.id ? { ...e, isDisabled: !reward.isDisabled } : e
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
    if (!editingReward?.name?.vi || editingReward.name.vi.trim() === "") {
      newErrors.nameVi = t("nameViRequired");
    }
    if (!editingReward?.name?.en || editingReward.name.en.trim() === "") {
      newErrors.nameEn = t("nameEnRequired");
    }
    if (
      !editingReward?.description?.vi ||
      editingReward.description.vi.trim() === ""
    ) {
      newErrors.descriptionVi = t("descriptionViRequired");
    }
    if (
      !editingReward?.description?.en ||
      editingReward.description.en.trim() === ""
    ) {
      newErrors.descriptionEn = t("descriptionEnRequired");
    }
    if (!editingReward.exchangePoint || editingReward.exchangePoint < 1) {
      newErrors.exchangePointRequired = t("exchangePointRequired");
    }
    if (!imageUrl && !editingReward?.image) {
      newErrors.image = t("imageRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openModal = (mode, reward = null) => {
    if (mode === "add") {
      setEditingReward({
        name: { en: "", vi: "" },
        description: { en: "", vi: "" },
        image: "",
      });
      setImageUrl("");
      setFileList([]);
    } else if (mode === "update") {
      setEditingReward(reward);
      setImageUrl(reward.image);
      setFileList(reward.image ? [{ url: reward.image }] : []);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
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
        setEditingReward((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.onerror = () => {
        toast.error(t("errorReadingImage", { ns: "common" }), {
          position: "top-right",
          autoClose: 2000,
        });
      };
      reader.readAsDataURL(fileObj);
      setFileList([info.fileList[info.fileList.length - 1]]);
    } else {
      setFileList([]);
      setImageUrl("");
      setEditingReward((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setImageUrl("");
    setEditingReward((prev) => ({ ...prev, image: "" }));
    message.info("Ảnh đã được xóa.");
  };

  // Ant Design Table columns
  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, record, index) => {
        if (record.isMoreButtonRow && visibleReward.length < countAll) {
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
      title: t("name"),
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.name?.[i18n.language];
      },
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.description?.[i18n.language];
      },
    },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (image, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <Image
            src={image}
            alt={record.name?.[i18n.language]}
            width={150}
            height={150}
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
        );
      },
    },
    {
      title: t("action", { ns: "common" }),
      key: "action",
      align: "center",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <button
            className="text-white px-3 py-1 buttonupdate"
            onClick={() => openModal("update", record)}
          >
            <Flex justify="center" align="center">
              <FaEdit className="iconupdate" />
              <span>{t("update", { ns: "common" })}</span>
            </Flex>
          </button>
        );
      },
    },
    {
      title: t("available", { ns: "common" }),
      dataIndex: "isDisabled",
      key: "isDisabled",
      align: "center",
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

  return (
    <div className="containers">
      {/* <Navbar /> */}
      {/* <div className="title-search"> */}
      <h1 className="container-title">{t("managementReward")}</h1>
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
          <Button className="rounded-add" onClick={() => openModal("add")}>
            <Flex justify="center" align="center" gap="small">
              <FaPlus />
              <span>{t("addNew", { ns: "common" })}</span>
            </Flex>
          </Button>
        </div>
        {/* <div className="table-container-reward"> */}
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
              visibleReward.length < countAll
                ? [
                    ...visibleReward,
                    { id: "more-button-row", isMoreButtonRow: true },
                  ]
                : visibleReward
            }
            pagination={false}
            rowKey="id"
            className="custom-table"
            scroll={{ y: "calc(100vh - 300px)" }}
          />
        )}

        {/* <div className="paginations">
                        {nextPageToken && visibleReward.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div> */}
        {/* </div> */}

        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {editingReward?.id ? t("updateReward") : t("addReward")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          <div className="form-content-reward">
            <div className="inputtext">
              <label className="titleinput">
                {t("name")} (Vietnamese) <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputNameVi")}
                value={editingReward?.name?.vi || ""}
                onChange={(e) =>
                  setEditingReward({
                    ...editingReward,
                    name: { ...editingReward.name, vi: e.target.value },
                  })
                }
              />
              {errors.nameVi && (
                <div className="error-text">{errors.nameVi}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("name")} (English) <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputNameEn")}
                value={editingReward?.name?.en || ""}
                onChange={(e) =>
                  setEditingReward({
                    ...editingReward,
                    name: { ...editingReward.name, en: e.target.value },
                  })
                }
              />
              {errors.nameEn && (
                <div className="error-text">{errors.nameEn}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("exchangePoint")}
                <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputextchangePoint")}
                value={editingReward?.exchangePoint || ""}
                onChange={(e) =>
                  setEditingReward({
                    ...editingReward,
                    exchangePoint: e.target.value,
                  })
                }
              />
              {errors.exchangePointRequired && (
                <div className="error-text">{errors.exchangePointRequired}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("image")} <span style={{ color: "red" }}>*</span>
              </label>
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
                <div className="image-preview-box-option">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    className="preview-image-option"
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
              {errors.image && <div className="error-text">{errors.image}</div>}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("description")} (Vietnamese){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <Input.TextArea
                placeholder={t("inputDescriptonVi")}
                value={editingReward?.description?.vi || ""}
                onChange={(e) =>
                  setEditingReward({
                    ...editingReward,
                    description: {
                      ...editingReward.description,
                      vi: e.target.value,
                    },
                  })
                }
                rows={4}
              />
              {errors.descriptionVi && (
                <div className="error-text">{errors.descriptionVi}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("description")} (English){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <Input.TextArea
                placeholder={t("inputDescriptonEn")}
                value={editingReward?.description?.en || ""}
                onChange={(e) =>
                  setEditingReward({
                    ...editingReward,
                    description: {
                      ...editingReward.description,
                      en: e.target.value,
                    },
                  })
                }
                rows={4}
              />
              {errors.descriptionEn && (
                <div className="error-text">{errors.descriptionEn}</div>
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

export default Rewards;
