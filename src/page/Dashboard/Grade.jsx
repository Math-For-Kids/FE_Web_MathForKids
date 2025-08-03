import React, { useState, useEffect, useContext } from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import { UserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { countAll, countPupilsByGrade } from "../../assets/api/Pupil";

export default function Grade() {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [countPupils, setCountPupils] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("dashboard", "lesson");
  const lang = i18n.language;

  const fetchData = async () => {
    try {
      const count = await countAll();
      setCountPupils(count.count);

      const response = await countPupilsByGrade();
      const rawData = response || [];
      const formatted = rawData.map((item, index) => ({
        type: `${t("grade")} ${index + 1}`, // "Lớp 1", "Lớp 2"
        total: item.total,
      }));
      setData(formatted);
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
  }, [lang]);

  const config = {
    data,
    angleField: "total",
    colorField: "type",
    label: {
      text: ({ total }) => {
        console.log(countPupils);
        return `${parseFloat(((total / countPupils) * 100).toFixed(2))}%`;
      },
      style: {
        fontWeight: "bold",
      },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          return (
            <div key={title}>
              {items.map((item) => {
                const { name, value, color } = item;
                return (
                  <div>
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
                            color: "var(--color-text-chart)",
                          }}
                        >
                          {t("total_pupils")}
                        </span>
                      </div>
                      <b style={{ color: "var(--color-text-chart)" }}>
                        {value}
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
    height: 457.5,
    width: 600,
  };
  return loading ? (
    <Flex justify="center" align="center" style={{ height: "473.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Flex justify="center" align="center">
      <Pie className="mt-3" {...config} />
    </Flex>
  );
}
