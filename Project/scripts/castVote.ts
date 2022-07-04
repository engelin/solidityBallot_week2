import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
// eslint-disable-next-line node/no-missing-import
import { CustomBallot, MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

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
  const ballotAddress = process.env.BALLOT_ADDRESS ?? "";
  const tokenAddress = process.env.TOKEN_ADDRESS ?? "";
  if (process.argv.length < 3) throw new Error("Proposal Number missing");
  const proposal_num = process.argv[2];
  if (process.argv.length < 4) throw new Error("Vote amount missing");
  const vote_amount = process.argv[3];

  console.log(
    `Attaching token contract interface to address ${tokenAddress}`
  );
  const tokenContract: MyToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as MyToken;
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: CustomBallot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as CustomBallot;

  const preMintVotePower = await tokenContract.getVotes(
    signer.address
  )

  console.log(`Testing: vote power before voting is ${preMintVotePower}}`)
  console.log(`Voting for proposal no. ${proposal_num}`);
  const tx = await ballotContract.vote(proposal_num, vote_amount);
  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Successfully voted for proposal no. ${proposal_num}. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
