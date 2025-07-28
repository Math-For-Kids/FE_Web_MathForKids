import React, { useState, useEffect } from "react";
import { Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { filterExerciseByIsDisabled } from "../../assets/api/Exercise";
import { countOptionByExercise } from "../../assets/api/TestQuestion";

export default function MoreButton({
  selectedLesson,
  exercises,
  setExercises,
  countExercises,
  nextPageToken,
  setNextPageToken,
}) {
  const { t, i18n } = useTranslation(["exercise", "common"]);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const result = await filterExerciseByIsDisabled(
        selectedLesson,
        3,
        nextPageToken
      );
      const exerciseArray = Array.isArray(result.data)
        ? result.data
        : Object.values(result.data); // chuyển object thành array
      const updatedExercises = await Promise.all(
        exerciseArray.map(async (exercise) => {
          const answer = exercise.answer;
          const options = exercise.option.map((opt) => opt);
          const counts = await countOptionByExercise(
            exercise.id,
            answer,
            options
          );
          console.log(counts);

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
      setExercises((prev) => [...prev, ...updatedExercises]);
      setNextPageToken(result.nextPageToken);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {nextPageToken && exercises.length < countExercises ? (
        loading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
        ) : (
          <Button className="load-more-btn" onClick={loadMore}>
            {t("More", { ns: "common" })}
          </Button>
        )
      ) : (
        <div className="load-more-btn"></div>
      )}
    </div>
  );
}
