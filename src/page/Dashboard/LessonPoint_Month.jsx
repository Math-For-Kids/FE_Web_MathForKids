import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getPointStatsByLessons } from "../../assets/api/Test";

export default function LessonPoint_Month({ monthRange, grade, type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("lesson");
  const lang = i18n.language;

  const fetchData = async () => {
    const [start, end] = monthRange;
    const formattedStart = start.startOf("day").toISOString();
    const formattedEnd = end.endOf("day").toISOString();
    console.log(formattedStart, formattedEnd);

    try {
      const rawResults = await getPointStatsByLessons(
        grade,
        type,
        formattedStart,
        formattedEnd
      );

      // Chuyển đổi từ dạng counts object sang mảng [lessonName, type, total]
      const transformed = [];
      for (const r of rawResults) {
        for (const key in r.counts) {
          transformed.push({
            lessonName: r.lessonName?.[lang],
            type: key,
            total: r.counts[key],
          });
        }
      }

      setData(transformed);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [lang, monthRange, grade, type]);

  const config = {
    data,
    xField: "lessonName",
    yField: "total",
    group: true,
    colorField: "type",
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
    },
    scale: {
      x: {
        type: "band",
        padding: 0.5,
      },
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const total = items.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={title}>
              <div style={{ marginBottom: 6 }}>{title}</div>
              {items.map((item) => {
                const { name, value, color } = item;
                console.log(value, total);
                const percent =
                  total > 0
                    ? parseFloat(((value / total) * 100).toFixed(1))
                    : 0;

                return (
                  <div key={name}>
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
                          style={{
                            marginRight: 30,
                          }}
                        >
                          {name}
                        </span>
                      </div>
                      <strong>{percent}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    },
    height: 350,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "371.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Column className="mt-3" {...config} />
  );
}
