import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import Navbar from "../../component/Navbar";
import { Input, Button, Modal, Table, Flex, Spin, Empty } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../assets/api/Api";
import "./notification.css";

const Notification = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [notificationsData, setNotificationsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [countAll, setCountAll] = useState("");
  const [visibleNotification, setVisibleNotification] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const notificationsPerPage = 10;
  const [errors, setErrors] = useState({});
  const { t, i18n } = useTranslation(["notification", "common"]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setVisibleNotification([]);
      setNotificationsData([]);
      setNextPageToken(null);
      await fetchAllNotifications(null);
    };
    fetchNotifications();
  }, []);

  const fetchAllNotifications = async (token = null) => {
    console.log(token);
    try {
      let url = `/generalnotification/getAll?pageSize=${notificationsPerPage}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const response = await api.get(url);
      const newNotifications = response.data.data || [];
      const responses = await api.get(`/generalnotification/countAll`);
      setCountAll(Number(responses.data.count));
      setNotificationsData((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const uniqueNewNotifications = newNotifications.filter(
          (n) => !existingIds.has(n.id)
        );
        return [...prev, ...uniqueNewNotifications];
      });
      setVisibleNotification((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const uniqueNewNotifications = newNotifications.filter(
          (n) => !existingIds.has(n.id)
        );
        return [...prev, ...uniqueNewNotifications];
      });
      setNextPageToken(response.data.nextPageToken || null);
      setTimeout(() => setLoading(false), 0);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        theme: user?.mode === "dark" ? "dark" : "light",
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const loadMore = async () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      await fetchAllNotifications(nextPageToken);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        theme: user?.mode === "dark" ? "dark" : "light",
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      setLoadingSave(true);
      try {
        const payload = {
          title: {
            vi: editingNotification.title.vi || "",
            en: editingNotification.title.en || "",
          },
          content: {
            vi: editingNotification.content.vi || "",
            en: editingNotification.content.en || "",
          },
          isRead: editingNotification.isRead || false,
        };
        if (editingNotification?.id) {
          await api.put(
            `/generalnotification/${editingNotification.id}`,
            payload
          );
          toast.success(t("updateSuccess", { ns: "common" }), {
            theme: user?.mode === "dark" ? "dark" : "light",
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          await api.post(`/generalnotification`, payload);
          toast.success(t("addSuccess", { ns: "common" }), {
            theme: user?.mode === "dark" ? "dark" : "light",
            position: "top-right",
            autoClose: 2000,
          });
        }
        setVisibleNotification([]);
        setNotificationsData([]);
        setNextPageToken(null);
        await fetchAllNotifications(null);
        closeModal();
      } catch (error) {
        toast.error(error.response?.data?.message?.[i18n.language], {
          theme: user?.mode === "dark" ? "dark" : "light",
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoadingSave(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Title Vi
    if (
      !editingNotification?.title?.vi ||
      editingNotification.title.vi.trim() === ""
    )
      newErrors.titleVi = t("titleViRequired");
    else if (editingNotification.title.vi.trim().length < 3)
      newErrors.titleVi = t("titleViLenghth");

    // Title En
    if (
      !editingNotification?.title?.en ||
      editingNotification.title.en.trim() === ""
    )
      newErrors.titleEn = t("titleEnRequired");
    else if (editingNotification.title.en.trim().length < 3)
      newErrors.titleEn = t("titleEnLenghth");

    // Content Vi
    if (
      !editingNotification?.content?.vi ||
      editingNotification.content.vi.trim() === ""
    )
      newErrors.contentVi = t("contentViRequired");
    else if (editingNotification.content.vi.trim().length < 10)
      newErrors.contentVi = t("contentViLenghth");

    // Content En
    if (
      !editingNotification?.content?.en ||
      editingNotification.content.en.trim() === ""
    )
      newErrors.contentEn = t("contentEnRequired");
    else if (editingNotification.content.en.trim().length < 10)
      newErrors.contentEn = t("contentEnLenghth");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openModal = (mode, notification = null) => {
    if (mode === "add") {
      setEditingNotification({
        title: { vi: "", en: "" },
        content: { vi: "", en: "" },
        isRead: false,
      });
    } else if (mode === "update") {
      setEditingNotification({
        ...notification,
        title: {
          vi: notification.title?.vi || "",
          en: notification.title?.en || "",
        },
        content: {
          vi: notification.content?.vi || "",
          en: notification.content?.en || "",
        },
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, record, index) => {
        if (record.isMoreButtonRow && visibleNotification.length < countAll) {
          return {
            children: (
              <Flex justify="center" align="center">
                {nextPageToken ? (
                  loadingMore ? (
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 20 }} spin />
                      }
                    />
                  ) : (
                    <Button className="load-more-btn" onClick={loadMore}>
                      {t("More", { ns: "common" })}
                    </Button>
                  )
                ) : (
                  <div className="load-more-btn"></div>
                )}
              </Flex>
            ),
            props: {
              colSpan: columns.length, // Trải dài toàn bộ cột
            },
          };
        }
        return index + 1;
      },
      align: "center",
    },
    {
      title: t("title"),
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.title?.[i18n.language] || "";
      },
    },
    {
      title: t("content"),
      dataIndex: "content",
      key: "content",
      render: (text, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.content?.[i18n.language] || "";
      },
    },
    {
      title: t("createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return record.createdAt;
      },
    },
  ];

  return (
    <div className="containers">
      {/* <Navbar /> */}
      <h1 className="container-title">{t("managementNotifications")}</h1>
      {/* <div className="title-search"> */}
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
            {/* <span className="filter-icon">
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
                            <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                        </span> */}
          </div>
          <button className="rounded-add" onClick={() => openModal("add")}>
            <Flex justify="center" align="center" gap="small">
              <FaPlus />
              <span>{t("addNew", { ns: "common" })}</span>
            </Flex>
          </button>
        </div>
        {/* <div> */}
          {loading ? (
            <Flex
              justify="center"
              align="center"
              style={{ height: "calc(100vh - 222px)" }}
            >
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              />
            </Flex>
          ) : (
            <Table
              columns={columns}
              dataSource={
                visibleNotification.length < countAll
                  ? [
                      ...visibleNotification,
                      { id: "more-button-row", isMoreButtonRow: true },
                    ]
                  : visibleNotification
              }
              pagination={false}
              rowKey="id"
              className="custom-table"
              scroll={{ y: "calc(100vh - 300px)" }}
              style={{ height: "calc(100vh - 222px)" }}
              locale={{
                emptyText: (
                  <Flex
                    justify="center"
                    align="center"
                    style={{ height: "calc(100vh - 355px)" }}
                  >
                    <div>
                      <Empty
                        description={t("nodata", { ns: "common" })}
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      ></Empty>
                    </div>
                  </Flex>
                ),
              }}
            />
          )}
          {/* <div className="paginations">
            {nextPageToken && visibleNotification.length < countAll ? (
              <Button className="load-more-btn" onClick={loadMore}>
                {t("More", { ns: "common" })}
              </Button>
            ) : null}
          </div> */}
        {/* </div> */}
        <Modal
          title={
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              {editingNotification?.id
                ? t("updateNotification")
                : t("addNotification")}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
          centered
        >
          <div className="form-content-lesson">
            <div className="inputtext">
              <label className="titleinput">
                {t("titleVi")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputTitleVi")}
                value={editingNotification?.title?.vi || ""}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    title: { ...editingNotification.title, vi: e.target.value },
                  })
                }
                styles={{
                  input: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.titleVi ? "error" : ""}
              />
              {errors.titleVi && (
                <div className="error-text">{errors.titleVi}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("titleEn")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder={t("inputTitleEn")}
                value={editingNotification?.title?.en || ""}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    title: { ...editingNotification.title, en: e.target.value },
                  })
                }
                styles={{
                  input: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.titleEn ? "error" : ""}
              />
              {errors.titleEn && (
                <div className="error-text">{errors.titleEn}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("contentVi")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input.TextArea
                placeholder={t("inputContentVi")}
                value={editingNotification?.content?.vi || ""}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    content: {
                      ...editingNotification.content,
                      vi: e.target.value,
                    },
                  })
                }
                rows={4}
                styles={{
                  textarea: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.contentVi ? "error" : ""}
              />
              {errors.contentVi && (
                <div className="error-text">{errors.contentVi}</div>
              )}
            </div>
            <div className="inputtext">
              <label className="titleinput">
                {t("contentEn")} <span style={{ color: "red" }}>*</span>
              </label>
              <Input.TextArea
                placeholder={t("inputContentEn")}
                value={editingNotification?.content?.en || ""}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    content: {
                      ...editingNotification.content,
                      en: e.target.value,
                    },
                  })
                }
                rows={4}
                styles={{
                  textarea: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.contentEn ? "error" : ""}
              />
              {errors.contentEn && (
                <div className="error-text">{errors.contentEn}</div>
              )}
            </div>
          </div>
          <div className="button-row">
            <Button className="cancel-button" onClick={closeModal} block>
              {t("cancel", { ns: "common" })}
            </Button>
            {loadingSave ? (
              <Button className="save-button">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 20, color: "#fff" }}
                      spin
                    />
                  }
                />
              </Button>
            ) : (
              <Button className="save-button" onClick={handleSave} block>
                {t("save", { ns: "common" })}
              </Button>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Notification;
