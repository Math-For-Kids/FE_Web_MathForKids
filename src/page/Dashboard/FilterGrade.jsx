import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function FilterGrade({ grade, setGrade }) {
  const { t, i18n } = useTranslation("lesson");

  return (
    <Select
      suffixIcon={<DownOutlined style={{ color: "var(--dropdown-icon)" }} />}
      value={grade}
      onChange={(value) => setGrade(value)}
      style={{ width: 120 }}
    >
      <Select.Option value={1}>{t("grade", { ns: "lesson" })} 1</Select.Option>
      <Select.Option value={2}>{t("grade", { ns: "lesson" })} 2</Select.Option>
      <Select.Option value={3}>{t("grade", { ns: "lesson" })} 3</Select.Option>
    </Select>
  );
}
