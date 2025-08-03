import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Flex, Space, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getByGradeAndType } from "../../assets/api/Lesson";
import {
  countExerciseByLessonAndDisabledStatus,
  filterExerciseByIsDisabled,
} from "../../assets/api/Exercise";
import { countOptionByExercise } from "../../assets/api/TestQuestion";

export default function Filter({
  setLoading,
  selectedLesson,
  setSelectedLesson,
  setExercises,
  setCountExercises,
  setNextPageToken,
}) {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation(["exercise", "lesson", "common"]);
  const [grade, setGrade] = useState(1);
  const [type, setType] = useState("addition");
  const [lessons, setLessons] = useState([]);

  const loadLessons = async () => {
    const lessonList = await getByGradeAndType(grade, type);
    setLessons(lessonList);
    if (lessonList.length > 0) {
      setSelectedLesson(lessonList[0].id);
    } else {
      setSelectedLesson(null); // Không có bài học nào
      setExercises([]); // Xoá bảng
      setCountExercises(0);
      setNextPageToken(null);
    }
  };

  const loadExercises = async () => {
    try {
      const countExercises = await countExerciseByLessonAndDisabledStatus(
        selectedLesson
      );
      setCountExercises(countExercises.count);
      const result = await filterExerciseByIsDisabled(selectedLesson, 4, null);
      const exerciseArray = Array.isArray(result.data)
        ? result.data
        : Object.values(result.data);

      const updatedExercises = await Promise.all(
        exerciseArray.map(async (exercise) => {
          const answer = exercise.answer;
          const options = exercise.option.map((opt) => opt);
          const counts = await countOptionByExercise(
            exercise.id,
            answer,
            options
          );

          // Gộp lại thành data để vẽ biểu đồ
          const chartData = [
            { type: answer?.[i18n.language], total: counts[0], isAnswer: true },
            ...options.map((opt, i) => ({
              type: opt?.[i18n.language],
              total: counts[i + 1],
              isAnswer: false,
            })),
          ];

          return {
            ...exercise,
            chartData,
          };
        })
      );
      setExercises(updatedExercises);
      setNextPageToken(result.nextPageToken);

      setTimeout(() => setLoading(false), 0);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        theme: user?.mode === "dark" ? "dark" : "light",
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    loadLessons();
  }, [grade, type]);

  useEffect(() => {
    setLoading(true);
    loadExercises();
  }, [selectedLesson, i18n.language]);

  return (
    <Flex align="center">
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
      {/* Select lớp */}
      <Space>
        <Select
          suffixIcon={
            <DownOutlined style={{ color: "var(--dropdown-icon)" }} />
          }
          value={grade}
          onChange={(value) => {
            setGrade(value);
            if (
              value === 1 &&
              (type === "multiplication" || type === "division")
            ) {
              setType("addition");
            }
          }}
          style={{ width: 120 }}
        >
          <Select.Option value={1}>
            {t("grade", { ns: "lesson" })} 1
          </Select.Option>
          <Select.Option value={2}>
            {t("grade", { ns: "lesson" })} 2
          </Select.Option>
          <Select.Option value={3}>
            {t("grade", { ns: "lesson" })} 3
          </Select.Option>
        </Select>
        {/* Select loại bài */}
        <Select
          suffixIcon={
            <DownOutlined style={{ color: "var(--dropdown-icon)" }} />
          }
          value={type}
          onChange={(value) => setType(value)}
          style={{ width: 150 }}
        >
          <Select.Option value="addition">
            {t("addition", { ns: "lesson" })}
          </Select.Option>
          <Select.Option value="subtraction">
            {t("subtraction", { ns: "lesson" })}
          </Select.Option>
          {grade != 1 && (
            <>
              <Select.Option value="multiplication">
                {t("multiplication", { ns: "lesson" })}
              </Select.Option>
              <Select.Option value="division">
                {t("division", { ns: "lesson" })}
              </Select.Option>
            </>
          )}
        </Select>
        {/* Select bài học */}
        <Select
          suffixIcon={
            <DownOutlined style={{ color: "var(--dropdown-icon)" }} />
          }
          value={selectedLesson}
          onChange={(value) => setSelectedLesson(value)}
          style={{ width: 350 }}
          placeholder={t("selectLesson")}
        >
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <Select.Option key={lesson.id} value={lesson.id}>
                {lesson.name?.[i18n.language] || lesson.id}
              </Select.Option>
            ))
          ) : (
            <Select.Option disabled key="no-data" value="">
              --- {t("no_lesson_available", { ns: "common" })} ---
            </Select.Option>
          )}
        </Select>
      </Space>
    </Flex>
  );
}
