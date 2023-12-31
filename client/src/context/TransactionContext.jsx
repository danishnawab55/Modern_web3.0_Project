import React, { useEffect, useState } from "react";
import { ethers } from "ethers";


import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
    // const Web3 = new Web3(window.ethereum);
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    // return transactionContract;
    console.log({
        provider,
        signer,
        transactionContract
    });
};

export const TransactionProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setformData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [currentAccount, setCurrentAccount] = useState('');
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionContract = getEthereumContract();

            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
            
            console.log(structuredTransactions);

            setTransactions(structuredTransactions);
            // console.log(availableTransactions);
        } catch (error) {
            console.log(error);
        }
      };

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
    
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if(accounts.length) {
                setCurrentAccount(accounts[0]);
    
                getAllTransactions();
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }

    }

    const checkIfTransactionsExist = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
    
            window.localStorage.setItem("transactionCount", transactionCount); //only work this func gonna do
        } catch (error) {
          console.log(error);
    
          throw new Error("No ethereum object");
        }
      };

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error){
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }
    
    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
    
            await ethereum.request({
              method: "eth_sendTransaction",
              params: [{
                from: currentAccount,
                to: addressTo,
                gas: "0x5208",
                value: parsedAmount._hex,
              }],
            });
    
            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
    
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            setIsLoading(false);
    
            const transactionsCount = await transactionContract.getTransactionCount();
    
            setTransactionCount(transactionsCount.toNumber());
            window.reload();
        } catch (error) {
          console.log(error);
    
          throw new Error("No ethereum object");
        }

    };

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
        getEthereumContract();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange, sendTransaction, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}
