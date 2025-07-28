import React, { useState, useEffect } from "react";
import { Card, Col, Row } from "antd";
import { useTranslation } from "react-i18next";
import CountUp from "react-countup";
import TotalParent from "./TotalParent";
import TotalPupil from "./TotalPupil";
import TotalEnabledLesson from "./TotalEnabledLesson";
import AverageExercise from "./AverageExercise";
import UserPupil from "./UserPupil";
import Grade from "./Grade";
import LessonPoint from "./LessonPoint";
import MathTypePoint from "./MathTypePoint";
import "./dashboard.css";

export default function Dashboard() {
  const { t, i18n } = useTranslation(["dashboard", "common", "lesson"]);
  const [activeTab, setActiveTab] = useState("userpupil");

  const tabList = [
    {
      key: "userpupil",
      tab: t("userpupil"),
    },
    {
      key: "grade",
      tab: t("grade_statistic"),
    },
    {
      key: "mathtype_point",
      tab: t("mathtype_point"),
    },
    {
      key: "lesson_point",
      tab: t("lesson_point"),
    },
  ];
  const contentList = {
    userpupil: <UserPupil />,
    grade: <Grade />,
    mathtype_point: <MathTypePoint />,
    lesson_point: <LessonPoint />,
  };

  return (
    <div>
      <div className="p-4">
        <Row gutter={16}>
          <Col span={6}>
            <TotalParent />
          </Col>
          <Col span={6}>
            <TotalPupil />
          </Col>
          <Col span={6}>
            <TotalEnabledLesson />
          </Col>
          <Col span={6}>
            <AverageExercise />
          </Col>
        </Row>
        <Card
          style={{
            width: "100%",
            marginTop: 20,
            minHeight: "500px",
            boxShadow: "5px 5px 10px rgb(218, 218, 244)",
          }}
          tabList={tabList}
          activeTabKey={activeTab}
          onTabChange={(key) => setActiveTab(key)}
        >
          {contentList[activeTab]}
        </Card>
      </div>
    </div>
  );
}
