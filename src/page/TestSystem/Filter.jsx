import React, { useState, useEffect, useContext } from "react";
import FilterGrade from "../Dashboard/FilterGrade";
import { UserContext } from "../../contexts/UserContext";
import { Flex, Space, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { rankingByGrade } from "../../assets/api/Test";

export default function Filter({ setLoading, setRanking }) {
  const { user } = useContext(UserContext);
  const [grade, setGrade] = useState(1);
  const { t, i18n } = useTranslation(["exercise", "lesson", "common"]);

  const loadRanking = async () => {
    try {
      const result = await rankingByGrade(grade);
      setRanking(result);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        theme: user?.mode === "dark" ? "dark" : "light",
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
        setLoading(false)
    }
  };

  useEffect(() => {
    setLoading(true);
    loadRanking();
  }, [grade]);

  return (
    <Flex align="center">
      <span className="filter-icon">
        <svg
          className="iconfilter"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        <button className="filter-text">
          {t("filterBy", { ns: "common" })}
        </button>
      </span>
      <FilterGrade grade={grade} setGrade={setGrade} />
    </Flex>
  );
}
