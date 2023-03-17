import { useEffect, useState } from 'react';
import Payroll from '../../contracts/payroll';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonAddress } from '@tonconnect/ui-react';
import { Address, OpenedContract } from 'ton-core';

export function usePayrollContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | [bigint, bigint, bigint, bigint, bigint, bigint]>(null);
  const userFriendlyAddress = useTonAddress(true);

  const payrollContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Payroll(
      Address.parse('EQDOVyMnu9fyhWrwEwpx412j0gAarGZVV8H7A63JzyfA-ujq') 
    );
    return client.open(contract) as OpenedContract<Payroll>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      console.log("Address: " + userFriendlyAddress)
      if (!payrollContract) return;
      if (userFriendlyAddress.length < 10) return;
      setVal(null);
      const val = await payrollContract.getIncomingStreamNext(Address.parseFriendly(userFriendlyAddress).address, BigInt(0));
      setVal(val);
    }
    getValue();
  }, [payrollContract, userFriendlyAddress]);

  return {
    value: val,
    address: payrollContract?.address,
  };
}
