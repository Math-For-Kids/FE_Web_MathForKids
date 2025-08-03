import React, { useEffect, useState, useContext } from "react";
import { Column } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { countUsersByQuarter } from "../../assets/api/User";
import { countPupilsByQuarter } from "../../assets/api/Pupil";

export default function UserPupil_Quarter({ selectedYearRange }) {
  const { user } = useContext(UserContext);
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
  }, [startYear, endYear, lang]);

  const config = {
    data,
    title: {
      title:
        startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`,
      align: "center",
    },
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
                  color: "var(--color-text-chart)",
                }}
              >
                {title}
              </div>
              {Object.entries(yearMap).map(([year, yearItems]) => (
                <div key={year} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--color-text-chart)",
                    }}
                  >
                    {year}
                  </div>
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
                          <span style={{ color: "var(--color-text-chart)" }}>
                            {origin?.type}
                          </span>
                        </div>
                        <b style={{ color: "var(--color-text-chart)" }}>
                          {origin?.total}
                        </b>
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
    theme: user?.mode === "dark" ? "dark" : "light",
    height: 420,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "441.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <div style={{ marginTop: 16 }}>
      <Column {...config} />
    </div>
  );
}
