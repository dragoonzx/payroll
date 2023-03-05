import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address, Sender, SenderArguments } from "ton-core";

export const payeeAddress = Address.parse(
  "kQA-a0hn2ufw1692jkdyioou_ZIprAwHSPFa3eW9w-aDJYF_"
);
export const defaultAmount = BigInt("100000000");

export function useTonConnect(): { sender: Sender; connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();

  return {
    sender: {
      send: async (args: SenderArguments) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
        });
      },
    },
    connected: tonConnectUI.connected,
  };
}
