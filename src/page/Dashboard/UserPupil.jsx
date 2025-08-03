import React, { useState, useEffect } from "react";
import { Segmented, Flex } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import FilterYear from "./FilterYear";
import FilterMonth from "./FilterMonth";
import UserPupil_Week from "./UserPupil_Week";
import UserPupil_Month from "./UserPupil_Month";
import UserPupil_Quarter from "./UserPupil_Quarter";
import UserPupil_Season from "./UserPupil_Season";
import UserPupil_Year from "./UserPupil_Year";

export default function UserPupilLineChart() {
  const { t, i18n } = useTranslation("dashboard");
  const [tab, setTab] = useState("week");
  const [range, setRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedMonthRange, setSelectedMonthRange] = useState([
    dayjs().subtract(5, "month"),
    dayjs(),
  ]);
  const [selectedYear, setSelectedYear] = useState([
    dayjs().subtract(1, "year").startOf("year"),
    dayjs().endOf("year"),
  ]);
  const [selectedYearRange, setSelectedYearRange] = useState([
    dayjs().subtract(4, "year"),
    dayjs(),
  ]);

  const renderComponent = () => {
    if (tab === "week") {
      return <UserPupil_Week range={range} />;
    } else if (tab === "year") {
      return <UserPupil_Year selectedYearRange={selectedYearRange} />;
    } else if (tab === "quarter") {
      return <UserPupil_Quarter selectedYearRange={selectedYear} />;
    } else if (tab === "season") {
      return <UserPupil_Season selectedYearRange={selectedYear} />;
    } else return <UserPupil_Month selectedMonthRange={selectedMonthRange} />;
  };

  const options = [
    { label: t("week"), value: "week" },
    { label: t("month"), value: "month" },
    { label: t("quarter"), value: "quarter" },
    { label: t("season"), value: "season" },
    { label: t("year"), value: "year" },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Segmented
          options={options}
          value={tab}
          onChange={(value) => setTab(value)}
        />
        {tab === "week" && (
          <FilterMonth
            selectedMonthRange={range}
            setSelectedMonthRange={setRange}
          />
        )}
        {tab === "month" && (
          <FilterMonth
            selectedMonthRange={selectedMonthRange}
            setSelectedMonthRange={setSelectedMonthRange}
          />
        )}
        {(tab === "quarter" || tab === "season") && (
          <FilterYear
            selectedYearRange={selectedYear}
            setSelectedYearRange={setSelectedYear}
          />
        )}
        {tab === "year" && (
          <FilterYear
            selectedYearRange={selectedYearRange}
            setSelectedYearRange={setSelectedYearRange}
          />
        )}
      </Flex>
      <div>{renderComponent()}</div>
    </div>
  );
}
