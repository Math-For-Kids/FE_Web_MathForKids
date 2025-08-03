import React, { useState, useEffect, useContext } from "react";
import {
  Flex,
  Modal,
  Button,
  Input,
  Upload,
  Select,
  Row,
  Col,
  Spin,
} from "antd";
import { FaEdit } from "react-icons/fa";
import { UserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../assets/api/Api";
import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

export default function UpdateExercise({ exercise, levels, setExercises }) {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation(["exercise", "common"]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(exercise);
  const [errors, setErrors] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

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

  const validate = () => {
    const newErrors = {};
    // Level
    if (!editingExercise?.levelId || editingExercise.levelId.trim() === "") {
      newErrors.levelId = t("levelIdRequired");
    }

    // Question Vi
    if (
      !editingExercise?.question?.vi ||
      editingExercise.question.vi.trim() === ""
    ) {
      newErrors.questionVi = t("questionViRequired");
    } else if (editingExercise.question.vi.trim().length < 3)
      newErrors.questionVi = t("questionViLength");

    //Question En
    if (
      !editingExercise?.question?.en ||
      editingExercise.question.en.trim() === ""
    ) {
      newErrors.questionEn = t("questionEnRequired");
    } else if (editingExercise.question.en.trim().length < 3)
      newErrors.questionEn = t("questionEnLength");

    const optionViErrors = [];
    const optionEnErrors = [];
    editingExercise?.option?.forEach((item, index) => {
      if (!item.vi || item.vi.trim() === "")
        optionViErrors.push(t("wrongAnswerViRequired"));
      else if (item.vi.trim().length < 3)
        optionViErrors.push(t("wrongAnswerViLength"));

      if (!item.en || item.en.trim() === "")
        optionEnErrors.push(t("wrongAnswerEnRequired"));
      else if (item.en.trim().length < 3)
        optionEnErrors.push(t("wrongAnswerEnLength"));
    });
    if (optionViErrors.length > 0) newErrors.optionVi = optionViErrors;
    if (optionEnErrors.length > 0) newErrors.optionEn = optionEnErrors;

    // Answer Vi
    if (
      !editingExercise?.answer?.vi ||
      editingExercise.answer.vi.trim() === ""
    ) {
      newErrors.answerVi = t("answerViRequired");
    } else if (editingExercise.answer.vi.trim().length < 3)
      newErrors.answerVi = t("answerViLength");

    // Answer En
    if (
      !editingExercise?.answer?.en ||
      editingExercise.answer.en.trim() === ""
    ) {
      newErrors.answerEn = t("answerEnRequired");
    } else if (editingExercise.answer.en.trim().length < 3)
      newErrors.answerEn = t("answerEnLength");

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setLoadingSave(true);
      try {
        const formData = new FormData();
        formData.append("levelId", editingExercise.levelId);
        // formData.append("lessonId", lessonId);
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
        await api.put(`/exercise/${editingExercise.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(t("updateSuccess", { ns: "common" }), {
          theme: user?.mode === "dark" ? "dark" : "light",
          position: "top-right",
          autoClose: 2000,
        });

        setExercises((prevList) =>
          prevList.map((ex) =>
            ex.id === editingExercise.id
              ? { ...ex, ...editingExercise } // updatedData là dữ liệu mới
              : ex
          )
        );
        closeModal();
      } catch (error) {
        console.error("Error saving exercise:", error);
        console.log("Server response:", error.response?.data); // Log chi tiết lỗi từ server
        toast.error(
          error.response?.data?.message?.[i18n.language] ||
            t("saveFailed", { ns: "common" }),
          {
            theme: user?.mode === "dark" ? "dark" : "light",
            position: "top-right",
            autoClose: 3000,
          }
        );
      } finally {
        setLoadingSave(false);
      }
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      <button
        className="text-white px-3 py-1 buttonupdate"
        onClick={() => openModal()}
      >
        <Flex justify="center" align="center">
          <FaEdit className="iconupdate" />
          <span>{t("update", { ns: "common" })}</span>
        </Flex>
      </button>
      <Modal
        title={
          <div style={{ textAlign: "center", fontSize: "24px" }}>
            {t("updateExercise")}
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
              {t("question")} ({t("vietnamese")}){" "}
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
              styles={{
                input: {
                  backgroundColor: "var(--date-picker-bg)",
                },
              }}
              status={errors.questionVi ? "error" : ""}
            />
            {errors.questionVi && (
              <div className="error-text">{errors.questionVi}</div>
            )}
          </div>
          <div className="inputtext">
            <label className="titleinput">
              {t("question")} ({t("english")}){" "}
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
              styles={{
                input: {
                  backgroundColor: "var(--date-picker-bg)",
                },
              }}
              status={errors.questionEn ? "error" : ""}
            />
            {errors.questionEn && (
              <div className="error-text">{errors.questionEn}</div>
            )}
          </div>
          <div className="inputtext">
            <label className="titleinput">{t("image")}</label>
            <Flex>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                fileList={fileList}
              >
                <button className="buttondetail">
                  <Flex justify="center" align="center">
                    <UploadOutlined className="iconupdate" />
                    <span>{t("inputImage")}</span>
                  </Flex>
                </button>
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
                      color: "var(--error-text)",
                      cursor: "pointer",
                      background: "var(--color-bg-container)",
                      borderRadius: "50%",
                      padding: 4,
                    }}
                  />
                </div>
              )}
            </Flex>
          </div>
          <div className="inputtext">
            <label className="titleinput">
              {t("level")} <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              suffixIcon={
                <DownOutlined style={{ color: "var(--dropdown-icon)" }} />
              }
              style={{ width: "100%", height: "50px" }}
              placeholder={t("selectLevelId")}
              value={editingExercise?.levelId || null}
              onChange={(value) =>
                setEditingExercise({
                  ...editingExercise,
                  levelId: value,
                })
              }
              status={errors.levelId ? "error" : ""}
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
                styles={{
                  input: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.answerVi ? "error" : ""}
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
                styles={{
                  input: {
                    backgroundColor: "var(--date-picker-bg)",
                  },
                }}
                status={errors.answerEn ? "error" : ""}
              />
            </div>
            <Row gutter={10}>
              {errors.answerVi ? (
                <Col span={12} className="error-text">
                  {errors.answerVi}
                </Col>
              ) : (
                <Col span={12} className="error-text"></Col>
              )}
              {errors.answerEn ? (
                <Col span={12} className="error-text">
                  {errors.answerEn}
                </Col>
              ) : (
                <Col span={12} className="error-text"></Col>
              )}
            </Row>
          </div>

          <div className="inputtext">
            <label className="titleinput">
              {t("options")} <span style={{ color: "red" }}>*</span>
            </label>
            {editingExercise?.option?.map((opt, index) => (
              <>
                <div
                  key={index}
                  className="option-text"
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "0",
                    position: "relative",
                  }}
                >
                  <Input
                    placeholder={`${t("option")} ${index + 1} (${t(
                      "vietnamese"
                    )})`}
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
                    styles={{
                      input: {
                        backgroundColor: "var(--date-picker-bg)",
                      },
                    }}
                    status={errors.optionVi?.[index] ? "error" : ""}
                  />
                  <Input
                    placeholder={`${t("option")} ${index + 1} (${t(
                      "english"
                    )})`}
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
                    styles={{
                      input: {
                        backgroundColor: "var(--date-picker-bg)",
                      },
                    }}
                    status={errors.optionEn?.[index] ? "error" : ""}
                  />
                  {editingExercise?.option.length !== 1 && (
                    <Button
                      onClick={() => removeOption(index)}
                      icon={<DeleteOutlined />}
                      style={{
                        position: "absolute",
                        right: "0",
                        top: "50%",
                        transform: "translateY(-50%) translateX(-10%)",
                        fontSize: "20",
                        color: "var(--error-text)",
                        cursor: "pointer",
                        background: "var(--color-bg-container)",
                        borderRadius: "50%",
                        height: "60%",
                      }}
                    />
                  )}
                </div>
                <Row
                  gutter={10}
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  {errors.optionVi?.[index] ? (
                    <Col span={12} className="error-text">
                      {errors.optionVi?.[index]}
                    </Col>
                  ) : (
                    <Col span={12} className="error-text"></Col>
                  )}
                  {errors.optionEn?.[index] ? (
                    <Col span={12} className="error-text">
                      {errors.optionEn?.[index]}
                    </Col>
                  ) : (
                    <Col span={12} className="error-text"></Col>
                  )}
                </Row>
              </>
            ))}
            {editingExercise?.option.length < 3 && (
              <button
                onClick={addOption}
                style={{ marginTop: "10px" }}
                className="buttondetail"
              >
                <Flex justify="center" align="center" gap="small">
                  <FaPlus />
                  <span>{t("addOption")}</span>
                </Flex>
              </button>
            )}
            {/* {errors.option && (
                <div className="error-text">{errors.option}</div>
              )} */}
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
  );
}
