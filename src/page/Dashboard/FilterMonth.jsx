import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

export default function FilterMonth({
  selectedMonthRange,
  setSelectedMonthRange,
}) {
  const { RangePicker } = DatePicker;
  return (
    <RangePicker
      picker="month"
      format="MM-YYYY"
      value={selectedMonthRange}
      onChange={(dates) => {
        const start = dates[0].startOf("month");
        const end = dates[1].endOf("month");
        setSelectedMonthRange([start, end]);
      }}
      disabledDate={(current) => {
        const today = dayjs();
        return current && current > today.endOf("month");
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
