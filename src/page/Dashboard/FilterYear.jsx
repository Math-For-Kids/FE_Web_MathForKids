import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

export default function FilterYear({
  selectedYearRange,
  setSelectedYearRange,
}) {
  const { RangePicker } = DatePicker;

  return (
    <RangePicker
      picker="year"
      value={selectedYearRange}
      onChange={(dates) => {
        const start = dates[0].startOf("year");
        const end = dates[1].endOf("year");
        setSelectedYearRange([start, end]);
      }}
      disabledDate={(current) => {
        const today = dayjs();
        return current && current > today.endOf("year");
      }}
      allowClear={false}
      styles={{
        root: {
          backgroundColor: "var(--date-picker-bg)",
        },
      }}
    />
  );
}
