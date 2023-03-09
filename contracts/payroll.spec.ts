import * as fs from "fs";
import { Cell, ContractProvider } from "ton-core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton-community/sandbox";
import Payroll from "./payroll"; // this is the interface class 

describe("Counter tests", () => {
  let blockchain: Blockchain;
  let wallet1: SandboxContract<TreasuryContract>;
  let payrollContract: SandboxContract<Payroll>;

  beforeEach(async () =>  {
    // initialize the blockchain sandbox
    blockchain = await Blockchain.create();
    blockchain.verbosity = {
      blockchainLogs: false,
      vmLogs: "none",
      debugLogs: true,
      print: true
    }
    wallet1 = await blockchain.treasury("user1");

    // prepare Payroll's initial code and data cells for deployment
    const payrollCode = Cell.fromBoc(fs.readFileSync("contracts/payroll.cell"))[0]; // compilation output 
    const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
    const payroll = Payroll.createForDeploy(payrollCode, blockchain);

    // deploy payroll
    payrollContract = blockchain.openContract(payroll);
    await payrollContract.sendDeploy(wallet1.getSender());
    blockchain.treasury
  }),

  // it("should get counter value", async () => {
  //   const value = await payrollContract.getIncomingStreamNext("fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260", BigInt(0));
  //   console.log(value);
  //   //expect(value).toEqual(17n);
  // });

  it("create stream", async () => {
    console.log("address: " + wallet1.address);
    await payrollContract.sendCreateStream(wallet1.getSender(), "0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260");

    const value = await payrollContract.getIncomingStreamNext("0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260", BigInt(0));
    console.log(value);

    // const outComing = await payrollContract.getOutcomingStream("fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260", BigInt(0));
    // console.log(value);

    
  });
});
