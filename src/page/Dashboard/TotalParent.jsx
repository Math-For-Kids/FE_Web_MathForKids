import React, { useState, useEffect } from "react";
import { Card, Flex, Statistic, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";
import { countParents } from "../../assets/api/User";

export default function TotalParent() {
  const [data, setData] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("dashboard");

  const fetchData = async () => {
    try {
      const response = await countParents();
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
            backgroundColor: "var(--total-parent-tag)",
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
                  <span style={{ fontWeight: "500" }}>{t("total_parent")}</span>
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
            <div className="card-icon" style={{ backgroundColor: "var(--total-parent-icon-bg)" }}>
              <svg
                className="w-6 h-6"
                fill="var(--total-parent-icon)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
              </svg>
            </div>
          </Flex>
        </div>
      </Flex>
    </Card>
  );
}
