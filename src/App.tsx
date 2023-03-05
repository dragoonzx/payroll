import "./App.css";
import "@twa-dev/sdk";
import { TonConnectButton } from "@tonconnect/ui-react";
import {
  defaultAmount,
  payeeAddress,
  useTonConnect,
} from "./hooks/useTonConnect";

function App() {
  const { connected, sender } = useTonConnect();

  const amountToSend = Number(defaultAmount) / 10 ** 9;

  return (
    <div className="App">
      <div className="Container">
        <TonConnectButton />

        <div className="Card">
          <b>Payee Testnet Address</b>
          <div className="Hint">
            {payeeAddress.toString().slice(0, 30) + "..."}
          </div>
        </div>
        <a
          className={`Button ${connected ? "Active" : "Disabled"}`}
          onClick={() =>
            sender.send({
              value: defaultAmount,
              to: payeeAddress,
            })
          }
        >
          Send {amountToSend} TON
        </a>
      </div>
    </div>
  );
}

export default App;
