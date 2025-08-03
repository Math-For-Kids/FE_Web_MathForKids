import React, { useState, useEffect, useContext } from "react";
import { Line } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../contexts/UserContext";
import { countUsersByYear } from "../../assets/api/User";
import { countPupilsByYear } from "../../assets/api/Pupil";

export default function UserPupil_Year({ selectedYearRange }) {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const fetchData = async () => {
    const startYear = selectedYearRange[0].year();
    const endYear = selectedYearRange[1].year();

    try {
      const [userRes, pupilRes] = await Promise.all([
        countUsersByYear(startYear, endYear),
        countPupilsByYear(startYear, endYear),
      ]);

      const userCounts = userRes.data || [];
      const pupilCounts = pupilRes.data || [];

      const chartData = [];

      userCounts.forEach((item, index) => {
        chartData.push({
          label: item.label,
          total: item.total,
          type: lang === "vi" ? "Phụ huynh mới" : "New parent",
        });

        if (pupilCounts[index]) {
          chartData.push({
            label: pupilCounts[index].label,
            total: pupilCounts[index].total,
            type: lang === "vi" ? "Học sinh mới" : "New pupil",
          });
        }
      });

      setData(chartData);
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
  }, [lang, selectedYearRange]);

  const config = {
    data,
    xField: "label",
    yField: "total",
    colorField: "type",
    shapeField: "smooth",
    theme: user?.mode === "dark" ? "dark" : "light",
    height: 420,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "441.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Line className="mt-3" {...config} />
  );
}
