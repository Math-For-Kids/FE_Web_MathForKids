import React, { useState, useEffect } from "react";
import { Card, Flex, Statistic, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";
import { countEnabledLesson } from "../../assets/api/Lesson";

export default function TotalEnabledLesson() {
  const [data, setData] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("dashboard");

  const fetchData = async () => {
    try {
      const response = await countEnabledLesson();
      setData(response.count);
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
            backgroundColor: "var(--total-lesson-tag)",
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
                  <span style={{ fontWeight: "500" }}>{t("TotalLessons")}</span>
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
                    <CountUp end={value} separator="," />
                  )
                }
              />
            </div>
            <div className="card-icon" style={{ backgroundColor: "var(--total-lesson-icon-bg)" }}>
              <svg
                fill="var(--total-lesson-icon)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
              </svg>
            </div>
          </Flex>
        </div>
      </Flex>
    </Card>
  );
}
