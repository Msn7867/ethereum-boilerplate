import { Button, Card, Input, Typography, Form, notification } from "antd";
import { useMemo, useState } from "react";
import contractInfo from "contracts/contractInfo.json";
import Address from "components/Address/Address";
import { useMoralis } from "react-moralis";

const { Text } = Typography;

export default function Contract() {
  const { Moralis } = useMoralis();
  const { contractName, networks, abi } = contractInfo;
  const [responses, setResponses] = useState({});
  const contractAddress = networks[1337].address;

  const displayedContractFunctions = useMemo(() => {
    if (!abi) return [];
    return abi.filter((method) => method["type"] === "function");
  }, [abi]);

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  return (
    <div style={{ margin: "auto", width: "80vw" ,height: "90vw", top: "35px", right : "0px", textTransform: "capitalize" }}>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Your contract: {contractName}
            <Address avatar="left" copyable address={contractAddress} size={8} />
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
      >
        <Form.Provider
          onFormFinish={async (name, { forms }) => {
            const params = forms[name].getFieldsValue();

            let isView = false;

            for (let method of abi) {
              if (method.name !== name) continue;
              if (method.stateMutability === "view") isView = true;
            }

            const options = {
              contractAddress,
              functionName: name,
              abi,
              params,
            };

            if (!isView) {
              const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
              tx.on("transactionHash", (hash) => {
                setResponses({ ...responses, [name]: { result: null, isLoading: true } });
                openNotification({
                  message: "🔊 New Transaction",
                  description: `📃 Tx Hash: ${hash}`,
                });
                console.log("🔊 New Transaction", hash);
              })
                .on("receipt", (receipt) => {
                  setResponses({ ...responses, [name]: { result: null, isLoading: false } });
                  openNotification({
                    message: "🔊 New Receipt",
                    description: `📃 Receipt: ${receipt.transactionHash}`,
                  });
                  console.log("🔊 New Receipt: ", receipt);
                })
                .on("error", (error) => {
                  console.log(error);
                });
            } else {
              Moralis.executeFunction(options).then((response) =>
                setResponses({ ...responses, [name]: { result: response, isLoading: false } })
              );
            }
          }}
        >
          {displayedContractFunctions &&
            displayedContractFunctions.map((item, key) => (
              <Card
                title={`${key + 1}. ${item?.name}`}
                size="small"
                style={{ marginBottom: "20px" }}
              >
                <Form layout="vertical" name={`${item.name}`}>
                  {item.inputs.map((input, key) => (
                    <Form.Item
                      label={`${input.name} (${input.type})`}
                      name={`${input.name}`}
                      required
                      style={{ marginBottom: "15px" }}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                  ))}
                  <Form.Item style={{ marginBottom: "5px" }}>
                    <Text style={{ display: "block" }}>
                      {responses[item.name]?.result && JSON.stringify(responses[item.name]?.result)}
                    </Text>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={responses[item?.name]?.isLoading}
                    >
                      {item.stateMutability === "view" ? "Read🔎" : "Transact💸"}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ))}
        </Form.Provider>
      </Card>
    </div>
  );
}
