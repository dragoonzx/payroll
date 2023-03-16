import * as fs from "fs";
import { Address, Cell, ContractProvider } from "ton-core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton-community/sandbox";
import Payroll from "./payroll"; // this is the interface class 
import {toBigIntBE, toBigIntLE, toBufferBE, toBufferLE} from 'bigint-buffer';

describe("Counter tests", () => {
  let blockchain: Blockchain;
  let sender: SandboxContract<TreasuryContract>;
  let receiver: SandboxContract<TreasuryContract>;
  let payrollContract: SandboxContract<Payroll>;

  beforeEach(async () =>  {
    // initialize the blockchain sandbox
    blockchain = await Blockchain.create();
    blockchain.verbosity = {
      blockchainLogs: false,
      vmLogs: "vm_logs",
      debugLogs: false,
      print: false
    }
    sender = await blockchain.treasury("sender");
    receiver = await blockchain.treasury("receiver");

    // prepare Payroll's initial code and data cells for deployment
    const payrollCode = Cell.fromBoc(fs.readFileSync("contracts/payroll.cell"))[0]; // compilation output 
    const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
    const payroll = Payroll.createForDeploy(payrollCode, blockchain);

    // deploy payroll
    payrollContract = blockchain.openContract(payroll);
    await payrollContract.sendDeploy(sender.getSender());
    blockchain.treasury
  }),


  it("create stream", async () => {
    const to = receiver.address;
    const startTime = Math.floor(Date.now()/1000 - 100000);
    const endTime = Math.floor(Date.now()/1000 + 100000);
    const amount = "1500";

    await payrollContract.sendCreateStream(sender.getSender(), to, startTime, endTime, amount);
    
    const value = await payrollContract.getIncomingStreamNext(to, BigInt(0));
    console.log(value);
    //0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260
    await payrollContract.sendClaim(sender.getSender(), to);

    // const outComing = await payrollContract.getOutcomingStream("fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260", BigInt(0));
    // console.log(value);

    
  });

  it.only("claim stream", async () => {
    const to = receiver.address;
    const startTime = Math.floor(Date.now()/1000 - 100000);
    const endTime = Math.floor(Date.now()/1000 + 100000);
    const amount = "1500";

    await payrollContract.sendCreateStream(sender.getSender(), to, startTime, endTime, amount);

    const value = await payrollContract.getIncomingStreamNext(to, BigInt(0));
    console.log(value);

    console.log("Balance of receiver: " + (await blockchain.getContract(receiver.address)).balance)
    console.log("Balance of payroll after stream create: " + (await blockchain.getContract(payrollContract.address)).balance)

    const buffer = toBufferBE(value[5], 32)
    const addr = new Address(0, buffer);

    await payrollContract.sendClaim(receiver.getSender(), addr);

    console.log("Balance of receiver after claim: " + (await blockchain.getContract(receiver.address)).balance)
    console.log("Balance of payroll after claim: " + (await blockchain.getContract(payrollContract.address)).balance)
    
  });
});
