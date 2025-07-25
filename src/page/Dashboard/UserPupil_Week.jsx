import React, { useState, useEffect } from "react";
import { Line } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { countUsersByWeek } from "../../assets/api/User";
import { countPupilsByWeek } from "../../assets/api/Pupil";

export default function UserPupil_Week({ range }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const fetchData = async () => {
    try {
      const startDate = range[0].startOf("month").format("YYYY-MM-DD");
      const endDate = range[1].endOf("month").format("YYYY-MM-DD");

      const [userRes, pupilRes] = await Promise.all([
        countUsersByWeek(startDate, endDate),
        countPupilsByWeek(startDate, endDate),
      ]);

      const userData = userRes.data || {};
      const pupilData = pupilRes.data || {};

      const chartData = [];
      const isSingleMonth = range[0].isSame(range[1], "month");

      Object.entries(userData).forEach(([key, counts]) => {
        const labelMonth = key; // "MM-YYYY"
        const prefix = lang === "vi" ? "T" : "W";

        counts.forEach((count, i) => {
          const label = isSingleMonth
            ? lang === "vi"
              ? `Tuần ${i + 1}`
              : `Week ${i + 1}`
            : `${prefix}${i + 1} (${labelMonth})`;

          chartData.push({
            label,
            total: count,
            type: lang === "vi" ? "Phụ huynh mới" : "New parent",
          });
        });
      });

      Object.entries(pupilData).forEach(([key, counts]) => {
        const labelMonth = key;
        const prefix = lang === "vi" ? "T" : "W";

        counts.forEach((count, i) => {
          const label = isSingleMonth
            ? lang === "vi"
              ? `Tuần ${i + 1}`
              : `Week ${i + 1}`
            : `${prefix}${i + 1} (${labelMonth})`;

          chartData.push({
            label,
            total: count,
            type: lang === "vi" ? "Học sinh mới" : "New pupil",
          });
        });
      });

      setData(chartData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [range, lang]); // Gọi lại khi thay đổi tháng/năm/ngôn ngữ

  const config = {
    data,
    xField: "label",
    yField: "total",
    colorField: "type",
    shapeField: "smooth",
    height: 350,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "371.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Line className="mt-3" {...config} />
  );
}
