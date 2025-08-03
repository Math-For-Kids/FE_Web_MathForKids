import React, { useEffect, useState } from "react";
import { Select, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function FilterGrade({ grade, setGrade, type, setType }) {
  const { t, i18n } = useTranslation("lesson");

  return (
    <Space>
      <Select
        suffixIcon={<DownOutlined style={{ color: "var(--dropdown-icon)" }} />}
        value={grade}
        onChange={(value) => {
          setGrade(value);
          if (
            value === 1 &&
            (type === "multiplication" || type === "division")
          ) {
            setType("addition");
          }
        }}
        style={{ width: 120 }}
      >
        <Select.Option value={1}>
          {t("grade", { ns: "lesson" })} 1
        </Select.Option>
        <Select.Option value={2}>
          {t("grade", { ns: "lesson" })} 2
        </Select.Option>
        <Select.Option value={3}>
          {t("grade", { ns: "lesson" })} 3
        </Select.Option>
      </Select>
      <Select
        suffixIcon={<DownOutlined style={{ color: "var(--dropdown-icon)" }} />}
        value={type}
        onChange={(value) => setType(value)}
        style={{ width: 150 }}
      >
        <Select.Option value="addition">
          {t("addition", { ns: "lesson" })}
        </Select.Option>
        <Select.Option value="subtraction">
          {t("subtraction", { ns: "lesson" })}
        </Select.Option>
        {grade != 1 && (
          <>
            <Select.Option value="multiplication">
              {t("multiplication", { ns: "lesson" })}
            </Select.Option>
            <Select.Option value="division">
              {t("division", { ns: "lesson" })}
            </Select.Option>
          </>
        )}
      </Select>
    </Space>
  );
}
