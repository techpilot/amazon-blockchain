import React, { createContext, useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { amazonAbi, amazonCoinAddress } from "../lib/constants";
import { ethers } from "ethers";

export const AmazonContext = createContext();

export const AmazonProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [assets, setAssets] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [etherscanLink, setEtherscanLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);

  const {
    authenticate,
    isAuthenticated,
    enableWeb3,
    Moralis,
    user,
    isWeb3Enabled,
  } = useMoralis();

  // get assets from moralis
  const {
    data: assetsData,
    error: assetsDataError,
    isLoading: assetsDataIsLoading,
  } = useMoralisQuery("assets");

  // get use data
  const {
    data: userData,
    error: userDataError,
    isLoading: userDataIsLoading,
  } = useMoralisQuery("_User");

  const handleSetUsername = async () => {
    if (user) {
      if (nickname) {
        user.set("nickname", nickname);
        user.save();
        setNickname("");
      } else {
        console.log("Please enter a nickname");
      }
    } else {
      console.log("no user");
    }
  };

  // get user token balance
  const getBalance = async () => {
    try {
      if (!isAuthenticated || !currentAccount) return;

      const options = {
        contractAddress: amazonCoinAddress,
        functionName: "balanceOf",
        abi: amazonAbi,
        params: {
          account: currentAccount,
        },
      };

      if (isWeb3Enabled) {
        const response = await Moralis.executeFunction(options);
        setBalance(response.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };

  // buy asset with erc tokens
  const buyAsset = async (price, asset) => {
    try {
      if (!isAuthenticated) return;

      const options = {
        type: "erc20",
        amount: price,
        receiver: amazonCoinAddress,
        contractAddress: amazonCoinAddress,
      };

      let transaction = await Moralis.transfer(options);
      const receipt = await transaction.wait();

      if (receipt) {
        const res = userData[0].add("ownedAssets", {
          ...asset,
          purchaseDate: Date.now(),
          etherscanLink: `https://ropsten.etherscan.io/tx/${receipt.transactionHash}`,
        });

        await res.save().then(() => {
          alert("You've successfully purchased this asset!");
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // buy amazon erc tokens with ETH
  const buyTokens = async () => {
    if (!isAuthenticated) {
      await authenticate();
    }

    const amount = ethers.BigNumber.from(tokenAmount);
    const price = ethers.BigNumber.from("100000000000000");
    const calcPrice = amount.mul(price);

    const options = {
      contractAddress: amazonCoinAddress,
      functionName: "mint",
      abi: amazonAbi,
      msgValue: calcPrice,
      params: {
        amount,
      },
    };

    const transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait(4);
    setIsLoading(false);
    console.log(receipt);
    setEtherscanLink(
      `https://ropsten.etherscan.io/tx/${receipt.transactionHash}`
    );
  };

  const listenToUpdates = async () => {
    let query = new Moralis.Query("EthTransactions");

    try {
      let subscription = await query.subscribe();
      subscription.on("update", (object) => {
        console.log(object);
        setRecentTransactions([object]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getAssets = async () => {
    try {
      await enableWeb3();
      setAssets(assetsData);
    } catch (error) {
      console.log(error);
    }
  };

  const getOwnedAssets = async () => {
    try {
      if (userData[0].attributes.ownedAssets) {
        setOwnedItems((prev) => [...prev, userData[0].attributes.ownedAssets]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        getBalance();
        listenToUpdates();
        const currentUsername = await user?.get("nickname");
        setUsername(currentUsername);
        const account = await user?.get("ethAddress");
        setCurrentAccount(account);
      }
    })();
  }, [isAuthenticated, user, username, currentAccount]);

  useEffect(() => {
    (async () => {
      if (isWeb3Enabled) {
        await getAssets();
        await getOwnedAssets();
      }
    })();
  }, [assetsData]);

  return (
    <AmazonContext.Provider
      value={{
        isAuthenticated,
        nickname,
        setNickname,
        username,
        handleSetUsername,
        assets,
        balance,
        tokenAmount,
        setTokenAmount,
        amountDue,
        setAmountDue,
        isLoading,
        setIsLoading,
        setEtherscanLink,
        etherscanLink,
        currentAccount,
        buyTokens,
        buyAsset,
        recentTransactions,
        ownedItems,
      }}
    >
      {children}
    </AmazonContext.Provider>
  );
};
