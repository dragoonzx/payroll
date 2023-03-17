import "./App.css";
import "@twa-dev/sdk";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import CountUp from "react-countup";
import {
  useTonConnect,
} from "./hooks/useTonConnect";
import { Address, beginCell, Cell} from "ton-core";
import { useEffect, useState } from "react";
import { usePayrollContract } from "./hooks/usePayrollContract";
import {toBigIntBE, toBigIntLE, toBufferBE, toBufferLE} from 'bigint-buffer';

function App() {
  const { connected, sender } = useTonConnect();
  const userFriendlyAddress = useTonAddress();
  const { value, address } = usePayrollContract();

  const [claimable, setClaimable] = useState(0);
  const [duration, setDuration] = useState(0);
  const [amount, setAmount] = useState(0.0);
  const [claimPayload, setClaimPayload] = useState<Cell|null>(null)

  useEffect(() => {
    //info from SC
    if(value == null) return;
    const startTime = Number(value[1]) 
    const endTime = Number(value[2])
    const amount = Number(value[3] / BigInt(1000000000))
    const claimed = Number(value[4] / BigInt(1000000000))
    const buffer = toBufferBE(value[5], 32)
    const fromAddress = new Address(0, buffer);

    const claimPayload =  beginCell()
    .storeUint(2, 32) // op (op #2 = claim stream)
    .storeUint(0, 64) // query id
    .storeAddress(fromAddress) 
    .endCell();

    //calculate for counter
    const perSecond = amount / (endTime - startTime);
    const curTime = Date.now()/1000;
    const lastTick = curTime > endTime ? endTime: curTime;
    const vested = (lastTick - startTime) * perSecond;
    const claimable = vested - claimed;

    setClaimable(claimable);
    setDuration(endTime-curTime);
    setAmount(amount)
    setClaimPayload(claimPayload)
  }, [value, connected]); 


  
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
              body: claimPayload
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
