import { ethers } from "ethers";
import "dotenv/config";
import * as TokenJson from "../artifacts/contracts/Token.sol/MyToken.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
    const wallet = process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
    console.log(`Using address ${wallet.address}`);

    // network
    const provider = ethers.providers.getDefaultProvider("ropsten");
    // connect to wallet
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

    if (balance < 0.01)
    {
        throw new Error("Not enough ether");
    }

    // check arguments
    const argv = require('minimist')(process.argv.slice(2), {
        string: ['address', 'target_address']
    });
    if (argv.length < 1 ||
        !argv['address'] ||
        !argv['target_address'])
    {
        throw new Error("Not enough arguments provided\n\x1b[33mUsage:\x1b[0m ts-node scripts/delegate.ts --address 0x999** --target_address 0x9999***");
    }

    const tokenAddress = argv['address'];
    const targetAddress = argv['target_address'];
    console.log('tokenAddress : ' + tokenAddress);
    console.log('targetAddress : ' + targetAddress);

    const tokenContract = new ethers.Contract(
        tokenAddress,
        TokenJson.abi,
        signer
    );

    // /**
    //  * @dev Delegate votes from the sender to `delegatee`.
    //  */
    //  function delegate(address delegatee) public virtual override {
    //     _delegate(_msgSender(), delegatee);
    // }

    const delegateTx = await tokenContract
        .delegate(targetAddress);
    await delegateTx.wait();
    console.log(`Complete delegation: ${delegateTx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});  
