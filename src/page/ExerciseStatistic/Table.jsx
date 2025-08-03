import React, { useState, useEffect, useContext } from "react";
import { Table, Image, Flex, Empty } from "antd";
import { FaEdit } from "react-icons/fa";
import { Column } from "@ant-design/plots";
import { UserContext } from "../../contexts/UserContext";
import MoreButton from "./MoreButton";
import { useTranslation } from "react-i18next";
import UpdateExercise from "./UpdateExercise";

export default function TableStatistic({
  selectedLesson,
  levels,
  exercises,
  setExercises,
  countExercises,
  nextPageToken,
  setNextPageToken,
}) {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation(["exercise", "common", "dashboard"]);

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
      width: 300,
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
      width: 300,
      render: (image, record) => {
        if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
        return image ? (
          <Image
            src={image}
            alt={record.question?.[i18n.language]}
            width={200}
            height={100}
          />
        ) : (
          <span style={{ width: 60, opacity: 0.5 }}>
            {t("none", { ns: "common" })}
          </span>
        );
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
              if (isAnswer)
                return user?.mode === "dark"
                  ? "rgba(154, 249, 58, 0.89)"
                  : "#4bb615ff";
              return user?.mode === "dark" ? "#db272aff" : "#ea3538ff";
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
                    <span style={{ color: "var(--color-text-chart)" }}>
                      {title}
                    </span>
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
                              <span
                                style={{ color: "var(--color-text-chart)" }}
                              >
                                {record.chartData.find((d) => d.type === title)
                                  ?.isAnswer
                                  ? t("true")
                                  : t("false")}
                              </span>
                            </div>
                            <b style={{ color: "var(--color-text-chart)" }}>
                              {value}
                            </b>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                marginLeft: 12,
                                color: "var(--color-text-chart)",
                              }}
                            >
                              {t("ratio")}
                            </span>
                            <b style={{ color: "var(--color-text-chart)" }}>
                              {percent}%
                            </b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              },
            },
          },
          theme: user?.mode === "dark" ? "dark" : "light",
        };

        return <Column {...config} />;
      },
    },
    // {
    //   title: t("action", { ns: "common" }),
    //   key: "action",
    //   align: "center",
    //   width: 150,
    //   render: (_, record) => {
    //     if (record.isMoreButtonRow) return { props: { colSpan: 0 } };
    //     return (
    //       <UpdateExercise
    //         exercise={record}
    //         setExercises={setExercises}
    //         levels={levels}
    //       />
    //     );
    //   },
    // },
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
      style={{ height: "calc(100vh - 225px)" }}
      tableLayout="fixed"
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
  );
}
