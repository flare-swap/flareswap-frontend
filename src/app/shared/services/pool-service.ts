import axios from "axios";

export class PoolService {
  public static refreshPool = (chainId: number, tokenA: string, tokenB: string, feeTier: number) => {
    try {
      // no need sync here. Just fetch pool cache on server
      console.log("Try to refresh pool cache ", chainId, tokenA, tokenB, feeTier);
      axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/pools/refresh-pool`, {
        params: {
          chainId,
          tokenA,
          tokenB,
          feeTier,
        },
      });
    } catch (error) {
      console.error("Try to refresh pool cache fail. It will be refreshed on next 10 mins");
    }
  };
}
