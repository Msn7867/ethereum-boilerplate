import React from "react";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import "antd/dist/antd.css";
import { Skeleton, Table } from "antd";
import styles from "./styles";
import { useERC20Transfers } from "hooks/useERC20Transfers";

function ERC20Transfers() {
  const { ERC20Transfers, chainId } = useERC20Transfers();
  const { Moralis } = useMoralis();

  const columns = [
    {
      title: "Token",
      dataIndex: "address",
      key: "address",
      render: (token) => getEllipsisTxt(token, 8),
    },
    {
      title: "From",
      dataIndex: "from_address",
      key: "from_address",
      render: (from) => getEllipsisTxt(from, 8),
    },
    {
      title: "To",
      dataIndex: "to_address",
      key: "to_address",
      render: (to) => getEllipsisTxt(to, 8),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value, item) => parseFloat(Moralis.Units.FromWei(value, item.decimals).toFixed(6)),
    },
    {
      title: "Hash",
      dataIndex: "transaction_hash",
      key: "transaction_hash",
      render: (hash) => (
        <a
          href={
            chainId === "0x1"
              ? `https://etherscan.io/tx/${hash}`
              : chainId === "0x38"
              ? `https://bscscan.com/tx/${hash}`
              : chainId === "0x89"
              ? `https://polygonscan.com/tx/${hash}`
              : `https://explorer.avax.network/search?query=${hash}`
          }
          target="_blank"
          rel="noreferrer"
        >
          View Transaction
        </a>
      ),
    },
  ];

  let key = 0;
  return (
    <div style={{ width: "80vw", padding: "15px" ,margin: "auto" ,height: "90vw", top: "35px", right : "0px", textTransform: "capitalize"}}>
      <h1 style={styles.title}>💸AVAX TRANSFERS</h1>
      <Skeleton loading={!ERC20Transfers}>
        <Table
          dataSource={ERC20Transfers}
          columns={columns}
          rowKey={(record) => {
            key++;
            return `${record.transaction_hash}-${key}`;
          }}
        />
      </Skeleton>
    </div>
  );
}

export default ERC20Transfers;
