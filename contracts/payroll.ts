import { Blockchain } from "@ton-community/sandbox";
import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell, ExternalAddress, TupleBuilder } from "ton-core";

export default class Payroll implements Contract {

  static createForDeploy(code: Cell, b: Blockchain): Payroll{
    const data = beginCell()
      .endCell();
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    const payroll =  new Payroll(address, { code, data });

    return payroll
  }
  
  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.01", // send 0.01 TON to contract for rent
      bounce: false
    });
  }
  

  async sendCreateStream(provider: ContractProvider, via: Sender, to: string) {
    const startTime = Math.floor(Date.now()/1000 - 10000);
    const endTime = Math.floor(Date.now()/1000 + 100000);

    const messageBody = beginCell()
      .storeUint(1, 32) // op (op #1 = create stream)
      .storeUint(0, 64) // query id
      .storeAddress(Address.parseRaw(to)) //receiver
      .storeInt(startTime, 64) //start time
      .storeInt(endTime, 64) //end time
      .endCell();

    await provider.internal(via, {
      value: "0.05", // send 0.05 TON for gas
      body: messageBody
    });
  }

  async getIncomingStreamNext(provider: ContractProvider, addr: string, pivot: bigint)
  : Promise<[bigint, bigint, bigint, bigint, bigint, bigint]> {
    const builder = new TupleBuilder;
    builder.writeAddress(Address.parseRaw(addr));
    builder.writeNumber(pivot);
    const { stack } = await provider.get("getIncomingStreamNext", builder.build());

    const to = stack.readBigNumber();
    const startTime = stack.readBigNumber();
    const endTime = stack.readBigNumber();
    const amount = stack.readBigNumber();
    const claimed = stack.readBigNumber();
    const key = stack.readBigNumber();

    return [to, startTime, endTime, amount, claimed, key];
  }

  async getOutcomingStream(provider: ContractProvider, addr: string)
  : Promise<[bigint, bigint, bigint, bigint, bigint]> {
    const builder = new TupleBuilder;
    builder.writeAddress(new Address(0, Buffer.from(addr)));
    const { stack } = await provider.get("getIncomingStreamNext", builder.build());

    const to = stack.readBigNumber();
    const startTime = stack.readBigNumber();
    const endTime = stack.readBigNumber();
    const amount = stack.readBigNumber();
    const claimed = stack.readBigNumber();

    return [to, startTime, endTime, amount, claimed];
  }
}