import React, { useState, useEffect, useContext } from "react";
import { Table, Flex, Empty, Pagination } from "antd";
import { useTranslation } from "react-i18next";
import { TrophyOutlined } from "@ant-design/icons";
import Icon1st from "./Icon1st";
import Icon2nd from "./Icon2nd";
import Icon3rd from "./Icon3rd";

export default function RankingTable({ ranking, currentPage }) {
  const { t, i18n } = useTranslation(["testsystem", "common"]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins === 0
      ? `${secs} ${t("s")}`
      : `${mins} ${t("m")} ${secs} ${t("s")}`;
  };

  const getRankIcon = (rank) => {
    const color =
      rank === 1
        ? "#FFD700"
        : rank === 2
        ? "#C0C0C0"
        : rank === 3
        ? "#CD7F32"
        : "#000";
    return <TrophyOutlined style={{ color }} />;
  };

  const columns = [
    {
      title: t(".no", { ns: "common" }),
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record, index) => {
        const no = (currentPage - 1) * 10 + index + 1;
        if (no === 1) return <Icon1st />;
        else if (no === 2) return <Icon2nd />;
        else if (no === 3) return <Icon3rd />;
        return no;
      },
    },
    {
      title: t("pupilld"),
      key: "fulName",
      render: (record) => record.pupil.fullName,
    },
    {
      title: t("total_point"),
      dataIndex: "point",
      key: "ponit",
      align: "center",
    },
    {
      title: t("total_duration"),
      dataIndex: "duration",
      key: "duration",
      align: "center",
      render: (duration) => formatDuration(duration),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <Table
      columns={columns}
      dataSource={ranking}
      pagination={false}
      rowKey="pupil"
      className="custom-table"
      scroll={{ y: "calc(100vh - 350px)" }}
      style={{ height: "calc(100vh - 275px)" }}
      tableLayout="fixed"
      locale={{
        emptyText: (
          <Flex
            justify="center"
            align="center"
            style={{ height: "calc(100vh - 355px)" }}
          >
            <div>
              <Empty
                description={t("nodata", { ns: "common" })}
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              ></Empty>
            </div>
          </Flex>
        ),
      }}
    />
  );
}
