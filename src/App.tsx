import "./App.css";
import "@twa-dev/sdk";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import CountUp from "react-countup";
import { useTonConnect } from "./hooks/useTonConnect";
import { Address, beginCell, Cell } from "ton-core";
import { useEffect, useState } from "react";
import { usePayrollContract } from "./hooks/usePayrollContract";
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from "bigint-buffer";

const SECONDS_IN_DAY = 86400;

const tabs = {
  payroll: "payroll",
  create: "create",
};

function App() {
  const { connected, sender } = useTonConnect();
  const userFriendlyAddress = useTonAddress();
  const { value, address } = usePayrollContract();

  const [tab, setTab] = useState(tabs.payroll);

  const [receiver, setReceiver] = useState<string>("");
  const [days, setDays] = useState<string>("");
  const [amountToStream, setAmountToStream] = useState<string>("");

  const handleCreateStream = async () => {
    if (!receiver && !days && !amountToStream) {
      return;
    }

    // total stream seconds
    // const streamInSeconds = +days * SECONDS_IN_DAY;
    // end of stream in seconds
    const endTimestamp = Math.floor(Date.now() / 1000 + +days * SECONDS_IN_DAY);

    // @todo write tx, amount should be converted to TON maybe
    // await createStreamTx(receiver, Number(amountToStream) * 10 ** 9, endTimestamp)
  };
  const [claimable, setClaimable] = useState(0);
  const [duration, setDuration] = useState(0);
  const [amount, setAmount] = useState(0.0);
  const [claimPayload, setClaimPayload] = useState<Cell | null>(null);

  useEffect(() => {
    //info from SC
    if (value == null) return;
    const startTime = Number(value[1]);
    const endTime = Number(value[2]);
    const amount = Number(value[3] / BigInt(1000000000));
    const claimed = Number(value[4] / BigInt(1000000000));
    const buffer = toBufferBE(value[5], 32);
    const fromAddress = new Address(0, buffer);

    const claimPayload = beginCell()
      .storeUint(2, 32) // op (op #2 = claim stream)
      .storeUint(0, 64) // query id
      .storeAddress(fromAddress)
      .endCell();

    //calculate for counter
    const perSecond = amount / (endTime - startTime);
    const curTime = Date.now() / 1000;
    const lastTick = curTime > endTime ? endTime : curTime;
    const vested = (lastTick - startTime) * perSecond;
    const claimable = vested - claimed;

    setClaimable(claimable);
    setDuration(endTime - curTime);
    setAmount(amount);
    setClaimPayload(claimPayload);
  }, [value, connected]);

  return (
    <div className="App">
      <div className="Container">
        <TonConnectButton />

        <div>
          <button
            onClick={() => setTab(tabs.payroll)}
            style={{ borderRadius: "8px 0 0 8px" }}
          >
            Payroll
          </button>
          <button
            onClick={() => setTab(tabs.create)}
            style={{ borderRadius: "0 8px 8px 0" }}
          >
            Create
          </button>
        </div>

        {tab === tabs.payroll ? (
          <>
            <div className="Card">
              <b>Available to claim</b>

              {!userFriendlyAddress ? (
                <div className="Hint">You first need to connect a wallet</div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "8px",
                    }}
                  >
                    <span style={{ marginRight: "6px" }}>Available now</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "6px" }}
                    >
                      <circle cx="28" cy="28" r="28" fill="#0088CC" />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M20.2088 18.5044L35.9132 18.5043C36.4688 18.5043 37.024 18.5859 37.6042 18.8564C38.2997 19.1806 38.6685 19.6916 38.9269 20.0695C38.947 20.0989 38.9658 20.1292 38.9832 20.1602C39.287 20.701 39.4436 21.2849 39.4436 21.913C39.4436 22.5098 39.3016 23.16 38.9832 23.7267C38.9802 23.7322 38.9771 23.7375 38.974 23.7429L29.0522 40.7864C28.8334 41.1623 28.4307 41.3928 27.9958 41.3913C27.5609 41.3898 27.1598 41.1563 26.9437 40.7789L17.2041 23.7718C17.2013 23.7672 17.1985 23.7626 17.1957 23.7579C16.9728 23.3906 16.6281 22.8226 16.5678 22.0896C16.5124 21.4155 16.6639 20.7401 17.0026 20.1545C17.3413 19.5688 17.8512 19.1006 18.4645 18.814C19.1221 18.5067 19.7885 18.5044 20.2088 18.5044ZM26.7827 20.9391L20.2088 20.9391C19.7769 20.9391 19.6111 20.9657 19.4952 21.0199C19.3349 21.0947 19.2003 21.2178 19.1103 21.3734C19.0203 21.5291 18.9796 21.7095 18.9944 21.8901C19.0029 21.9936 19.0451 22.112 19.294 22.5225C19.2992 22.5311 19.3043 22.5398 19.3093 22.5485L26.7827 35.5984V20.9391ZM29.2175 20.9391V35.6629L36.864 22.5278C36.9503 22.371 37.0088 22.1444 37.0088 21.913C37.0088 21.7253 36.9699 21.5623 36.8829 21.3943C36.7916 21.263 36.736 21.1935 36.6895 21.1459C36.6496 21.1052 36.6189 21.0834 36.5755 21.0632C36.3947 20.9789 36.2097 20.9391 35.9132 20.9391L29.2175 20.9391Z"
                        fill="white"
                      />
                    </svg>

                    <CountUp
                      start={claimable}
                      end={amount}
                      duration={duration}
                      separator=" "
                      decimals={4}
                      enableScrollSpy
                    >
                      {({ countUpRef }) => (
                        <div className="truncate">
                          <span ref={countUpRef} />
                        </div>
                      )}
                    </CountUp>
                  </div>
                </>
              )}
            </div>
            <button
              className={`Button ${connected ? "Active" : "Disabled"}`}
              onClick={() =>
                sender.send({
                  value: BigInt("200000000"), //0.02
                  to: address as Address,
                  body: claimPayload,
                })
              }
            >
              Claim
            </button>
          </>
        ) : (
          <>
            <div className="Card">
              <b>Create stream</b>
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <label htmlFor="receiver">Receiver</label>
                  <input
                    type="text"
                    placeholder="kQaret..."
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid white",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      marginTop: "4px",
                    }}
                    value={receiver}
                    onChange={(e: any) => setReceiver(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <label htmlFor="receiver">Duration of stream (in days)</label>
                  <input
                    type="text"
                    placeholder="30 days"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid white",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      marginTop: "4px",
                    }}
                    value={days}
                    onChange={(e: any) => setDays(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <label htmlFor="receiver">Amount (in TON)</label>
                  <input
                    type="text"
                    placeholder="100 TON"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid white",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      marginTop: "4px",
                    }}
                    value={amountToStream}
                    onChange={(e: any) => setAmountToStream(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button
              className={`Button ${connected ? "Active" : "Disabled"}`}
              onClick={handleCreateStream}
            >
              Create stream
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
