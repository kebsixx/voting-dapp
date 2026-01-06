"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract";

function App() {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const canVote = account && !hasVoted && !isAdmin && !isVoting;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  };

  const getContract = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const getReadOnlyContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const isAdminUser = async () => {
    if (!account) return;

    const contract = await getContract();
    const owner = await contract.admin();