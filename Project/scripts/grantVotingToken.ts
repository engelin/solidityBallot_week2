import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
// eslint-disable-next-line node/no-missing-import
import { CustomBallot, MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const BASE_VOTE_POWER = 10;

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  if (process.argv.length < 3) throw new Error("Voter address missing");
  const voterAddress = process.argv[2];
  const tokenAddress = process.env.TOKEN_ADDRESS ?? "";

  console.log(
    `Attaching token contract interface to address ${tokenAddress}`
  );

  const tokenContract: MyToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as MyToken;

  const preMintTokens = await tokenContract.balanceOf(voterAddress);  
  console.log(`Tokens before minting: ${preMintTokens}`);

  const mintTx = await tokenContract.mint(
    voterAddress,
    ethers.utils.parseEther(BASE_VOTE_POWER.toFixed(18))
  );

  await mintTx.wait();
  console.log(`Transaction completed. Hash: ${mintTx.hash}`);
  
  const postMintTokens = await tokenContract.balanceOf(voterAddress);  
  console.log(`Tokens after minting: ${postMintTokens}`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
