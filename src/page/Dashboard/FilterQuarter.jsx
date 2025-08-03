import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);

export default function FilterQuarter({ quarterRange, setQuarterRange }) {
  const { RangePicker } = DatePicker;

  return (
    <RangePicker
      picker="quarter"
      value={quarterRange}
      onChange={(dates) => {
        const start = dates[0].startOf("quarter");
        const end = dates[1].endOf("quarter");
        setQuarterRange([start, end]);
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
