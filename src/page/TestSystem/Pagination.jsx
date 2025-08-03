import React, { useState, useEffect } from "react";
import { Pagination } from "antd";

export default function RankingPagination({
  ranking,
  setPaginatedData,
  currentPage,
  setCurrentPage,
}) {
  const pageSize = 10;

  const paginatedData = () => {
    setPaginatedData(
      ranking.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    );
  };

  useEffect(() => {
    paginatedData();
  }, [currentPage]);

  return (
    <Pagination
      style={{ marginTop: "15px" }}
      align="center"
      total={ranking.length}
      pageSize={pageSize}
      currentPage={currentPage}
      onChange={(page) => setCurrentPage(page)}
    />
  );
}
