import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { countUsersByQuarter } from "../../assets/api/User";
import { countPupilsByQuarter } from "../../assets/api/Pupil";

export default function UserPupil_Quarter({ selectedYearRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const startYear = selectedYearRange[0].year();
  const endYear = selectedYearRange[1].year();

  const fetchData = async () => {
    try {
      const [userRes, pupilRes] = await Promise.all([
        countUsersByQuarter(startYear, endYear),
        countPupilsByQuarter(startYear, endYear),
      ]);

      const users = userRes.data || [];
      const pupils = pupilRes.data || [];
      const chartData = [];
      const map = {};

      const getQuarterLabel = (q) =>
        lang === "vi" ? `Quý ${q}` : `Quarter ${q}`;

      users.forEach((item) => {
        const [q, y] = item.label.replace("Q", "").split("-");
        const quarter = getQuarterLabel(q);
        const type = lang === "vi" ? "Phụ huynh mới" : "New parent";

        chartData.push({ year: y, quarter, total: item.total, type });

        if (!map[quarter]) map[quarter] = {};
        if (!map[quarter][y]) map[quarter][y] = [];
        map[quarter][y].push({ total: item.total, type });
      });

      pupils.forEach((item) => {
        const [q, y] = item.label.replace("Q", "").split("-");
        const quarter = getQuarterLabel(q);
        const type = lang === "vi" ? "Học sinh mới" : "New pupil";

        chartData.push({ year: y, quarter, total: item.total, type });

        if (!map[quarter]) map[quarter] = {};
        if (!map[quarter][y]) map[quarter][y] = [];
        map[quarter][y].push({ total: item.total, type });
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
  }, [startYear, endYear, lang]);

  const config = {
    data,
    xField: "quarter",
    yField: "total",
    seriesField: "year",
    stack: {
      groupBy: ["x", "series"],
      series: false,
    },
    colorField: "type",
    label: {
      text: ({ total }) => {
        return total ? total : "";
      },
      position: "inside",
      style: {
        fill: "#fff",
        // fontSize: "12px",
        fontWeight: "bold",
      },
    },
    tooltip: (item) => {
      return { origin: item };
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          // Gom nhóm theo year từ origin.year
          const yearMap = {};
          items.forEach((item) => {
            const year = item.origin?.year || "Unknown";
            if (!yearMap[year]) yearMap[year] = [];
            yearMap[year].push(item);
          });

          return (
            <div
              style={{
                padding: 8,
                minWidth: 160,
                position: "relative",
                zIndex: 3,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {title}
              </div>
              {Object.entries(yearMap).map(([year, yearItems]) => (
                <div key={year} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{year}</div>
                  {yearItems.map((item, index) => {
                    const { color, origin } = item;
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginLeft: 8,
                          marginBottom: 2,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                          <span>{origin?.type}</span>
                        </div>
                        <b>{origin?.total}</b>
                      </div>
                    );
                  })}
                </div>
              ))}
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
    <div style={{ marginTop: 16 }}>
      <Column {...config} />
    </div>
  );
}
