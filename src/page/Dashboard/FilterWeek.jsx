import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

export default function FilterWeek({ weekRange, setWeekRange }) {
  const { RangePicker } = DatePicker;

  return (
    <RangePicker
      picker="week"
      value={weekRange}
      onChange={(dates) => {
        const start = dates[0].startOf("week");
        const end = dates[1].endOf("week");
        setWeekRange([start, end]);
      }}
      disabledDate={(current) => current && current > dayjs().endOf("day")}
      allowClear={false}
      styles={{
        root: {
          backgroundColor: "var(--date-picker-bg)",
        },
      }}
    />
  );
}
