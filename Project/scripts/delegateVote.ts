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
  const wallet = new ethers.Wallet(process.env.VOTER_PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
//   if (process.argv.length < 3) throw new Error("Voter address missing");
  const voterAddress = wallet.address;
  if (process.argv.length == 4){
    const toAddress = process.argv[3];
  }
  const tokenAddress = process.env.TOKEN_ADDRESS ?? "";

//   const voter = new ethers.Wallet(process.env.VOTER_PRIVATE_KEY ?? EXPOSED_KEY);
//   const voterSigner = wallet.connect(provider);

  console.log(
    `Attaching token contract interface to address ${tokenAddress}`
  );

  const tokenContract: MyToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as MyToken;


  const preDelegateTokens = await tokenContract.balanceOf(voterAddress);
  const preDelegateVotingPower = await tokenContract.getVotes(voterAddress);
  console.log(`Tokens before self-delegating: ${preDelegateTokens}`);
  console.log(`Voting power before self-delegating: ${preDelegateVotingPower}`);

  const delegateTx = await tokenContract.connect(signer).delegate(voterAddress);
  await delegateTx.wait();

  console.log(`Delegation completed. Hash: ${delegateTx.hash}`);
  
  const postDelegateTokens = await tokenContract.balanceOf(voterAddress);
  const postDelegateVotingPower = await tokenContract.getVotes(voterAddress);  
  
  console.log(`Tokens after self-delegating: ${postDelegateTokens}`);
  console.log(`Voting Power after self-delegating: ${postDelegateVotingPower}`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
