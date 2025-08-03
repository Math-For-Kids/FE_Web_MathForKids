import React, { useState, useEffect } from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Table from "./Table";
import Filter from "./Filter";
import { getEnabledLevels } from "../../assets/api/Level";
import "../Exercise/exercise.css";

export default function ExerciseStatistic() {
  const { t, i18n } = useTranslation(["exercise", "common"]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [countExercises, setCountExercises] = useState("");
  const [nextPageToken, setNextPageToken] = useState("");

  const loadLevels = async () => {
    const levelList = await getEnabledLevels();
    setLevels(levelList);
  };

  useEffect(() => {
    loadLevels();
  }, []);

  return (
    <div>
      <h1 className="container-title">{t("exercise_statistic")}</h1>
      <div className="containers-content">
        <Filter
          setLoading={setLoading}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          setExercises={setExercises}
          setCountExercises={setCountExercises}
          setNextPageToken={setNextPageToken}
        />
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
            selectedLesson={selectedLesson}
            levels={levels}
            exercises={exercises}
            setExercises={setExercises}
            countExercises={countExercises}
            nextPageToken={nextPageToken}
            setNextPageToken={setNextPageToken}
          />
        )}
      </div>
    </div>
  );
}
