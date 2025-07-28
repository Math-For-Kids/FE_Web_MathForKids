import React, { useState, useEffect } from "react";
import { Table, Image, Flex } from "antd";
import { FaEdit } from "react-icons/fa";
import { Column } from "@ant-design/plots";
import MoreButton from "./MoreButton";
import { useTranslation } from "react-i18next";
import { getEnabledLevels } from "../../assets/api/Level";

export default function TableStatistic({
  selectedLesson,
  exercises,
  setExercises,
  countExercises,
  nextPageToken,
  setNextPageToken,
}) {
  const [levels, setLevels] = useState([]);
  const { t, i18n } = useTranslation(["exercise", "common", "dashboard"]);

  const loadLevels = async () => {
    const levelList = await getEnabledLevels();
    setLevels(levelList);
  };

  useEffect(() => {
    console.log(exercises);
    loadLevels();
  }, []);

  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, record, index) => {
        if (record.isMoreButtonRow && exercises.length < countExercises) {
          return {
            children: (
              <Flex justify="center" align="center">
                <MoreButton
                  selectedLesson={selectedLesson}
                  exercises={exercises}
                  setExercises={setExercises}
                  countExercises={countExercises}
                  nextPageToken={nextPageToken}
                  setNextPageToken={setNextPageToken}
                />
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
      title: t("question_level"),
      key: "question",
      width: 250,
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };

        const questionText = record.question?.[i18n.language];
        const level = levels.find((level) => level.id === record.levelId);
        const levelName = level?.name?.[i18n.language];
        return (
          <div>
            <p>
              <strong>{levelName}</strong>
            </p>
            <p>{questionText}</p>
          </div>
        );
      },
    },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 220,
      render: (image, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return image ? (
          <Image
            src={image}
            alt={record.question?.[i18n.language]}
            width={200}
            height={100}
          />
        ) : null;
      },
    },
    {
      title: t("chart"),
      key: "chart",
      align: "center",
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        const config = {
          data: record.chartData || [],
          xField: "type",
          yField: "total",
          height: 150,
          width: 400,
          axis: {
            x: {
              labelAutoEllipsis: {
                suffix: "...",
                minLength: 10,
                maxLength: 14,
              },
              labelAutoWrap: {
                wordWrapWidth: 80,
                maxLines: 1,
                recoverWhenFailed: true,
              },
              labelAlign: "horizontal",
              size: 10,
            },
            y: false,
          },
          style: {
            fill: ({ isAnswer }) => {
              if (isAnswer) return "#389e0d";
              return "#cf1322";
            },
            maxWidth: 50,
          },
          interaction: {
            tooltip: {
              render: (e, { title, items }) => {
                const total = (record.chartData || []).reduce(
                  (sum, d) => sum + d.total,
                  0
                );
                return (
                  <div key={title}>
                    <span>{title}</span>
                    {items.map((item) => {
                      const { name, value, color } = item;
                      const percent =
                        total > 0
                          ? parseFloat(((value / total) * 100).toFixed(2))
                          : 0;
                      return (
                        <div style={{ marginTop: 4, width: 120 }}>
                          <div
                            style={{
                              margin: 0,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: color,
                                  marginRight: 6,
                                }}
                              ></span>
                              <span>
                                {record.chartData.find((d) => d.type === title)
                                  ?.isAnswer
                                  ? t("true")
                                  : t("false")}
                              </span>
                            </div>
                            <b>{value}</b>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ marginLeft: 12 }}>{t("ratio")}</span>
                            <b>{percent}%</b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              },
            },
          },
        };

        return <Column {...config} />;
      },
    },
    {
      title: t("action", { ns: "common" }),
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return (
          <div>
            <button
              className="text-white px-3 py-1 buttonupdate"
              // onClick={() => openModal("update", record)}
            >
              <Flex justify="center" align="center">
                <FaEdit className="iconupdate" />
                <span>{t("update", { ns: "common" })}</span>
              </Flex>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={
        exercises.length < countExercises
          ? [...exercises, { id: "more-button-row", isMoreButtonRow: true }]
          : exercises
      }
      pagination={false}
      rowKey="id"
      className="custom-table"
      scroll={{ y: "calc(100vh - 300px)" }}
    />
  );
}
