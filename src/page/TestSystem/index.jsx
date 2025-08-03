import React, { useState, useEffect } from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Table from "./Table";
import Filter from "./Filter";
import Pagination from "./Pagination";

export default function index() {
  const { t, i18n } = useTranslation(["testsystem", "common"]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState();

  return (
    <div>
      <h1 className="container-title">{t("managementTestSystem")}</h1>
      <div className="containers-content">
        <Filter setLoading={setLoading} setRanking={setRanking} />
        {loading ? (
          <Flex
            justify="center"
            align="center"
            style={{ height: "calc(100vh - 225px)" }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </Flex>
        ) : (
          <>
            <Table ranking={paginatedData} currentPage={currentPage} />
            <Pagination
              ranking={ranking}
              setPaginatedData={setPaginatedData}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
