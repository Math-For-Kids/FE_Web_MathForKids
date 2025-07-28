import React, { useState, useEffect } from "react";
import { Card, Flex, Statistic, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";
import { averageExercisePerLesson } from "../../assets/api/Exercise";

export default function AverageExercise() {
  const [data, setData] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("dashboard");

  const fetchData = async () => {
    try {
      const response = await averageExercisePerLesson();
      setData(response);
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
    fetchData();
  }, []);

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Flex align="center">
        <span
          style={{
            height: 100,
            width: 20,
            backgroundColor: "#00AC69",
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          }}
        ></span>
        <div style={{ width: "100%" }}>
          <Flex
            justify="space-between"
            align="center"
            style={{
              padding: "0 20px",
              width: "100%",
            }}
          >
            <div>
              <Statistic
                title={
                  <span style={{ fontWeight: "500" }}>
                    {t("average_exercises")}
                  </span>
                }
                value={loading ? undefined : data}
                formatter={(value) =>
                  loading ? (
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 20 }} spin />
                      }
                    />
                  ) : (
                    <CountUp end={value} separator="," decimals={2} />
                  )
                }
                precision={2}
              />
            </div>
            <div className="card-icon" style={{ backgroundColor: "#FED7AA" }}>
              <svg
                fill="#FB923C"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
              </svg>
            </div>
          </Flex>
        </div>
      </Flex>
    </Card>
  );
}
