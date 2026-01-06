"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "./contract";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
import CandidateList from "../components/CandidateList";
import CandidateForm from "../components/CandidateForm";
import WalletButton from "../components/WalletButton";

export default function VotingPage() {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

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
    setIsAdmin(owner.toLowerCase() === account.toLowerCase());
  };

  const addCandidate = async (name) => {
    setLoadingAdd(true);
    try {
      const contract = await getContract();
      const tx = await contract.addCandidate(name);
      await tx.wait();
      loadCandidates();
    } finally {
      setLoadingAdd(false);
    }
  };

  const loadCandidates = async () => {
    const contract = await getContract();
    const data = await contract.getCandidates();
    setCandidates(data);
  };

  const checkVoteStatus = async () => {
    if (!account) return;
    const contract = await getContract();
    const voted = await contract.hasUserVoted(account);
    setHasVoted(voted);
  };

  const vote = async (id) => {
    try {
      setIsVoting(true);
      const contract = await getContract();
      const tx = await contract.vote(id);
      await tx.wait();
      loadCandidates();
      checkVoteStatus();
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    if (!account) return;
    let contract;
    const setupListener = async () => {
      contract = await getReadOnlyContract();
      contract.on("CandidateAdded", () => {
        loadCandidates();
      });
    };
    setupListener();
    return () => {
      if (contract) {
        contract.removeAllListeners("CandidateAdded");
      }
    };
  }, [account]);

  useEffect(() => {
    if (!account) return;
    let contract;
    const setupListener = async () => {
      contract = await getReadOnlyContract();
      contract.on("Voted", (voter, candidateId) => {
        if (voter.toLowerCase() === account.toLowerCase()) {
          setHasVoted(true);
        }
        loadCandidates();
      });
    };
    setupListener();
    return () => {
      if (contract) {
        contract.removeAllListeners("Voted");
      }
    };
  }, [account]);

  useEffect(() => {
    if (!account) return;
    setHasVoted(false);
    setIsAdmin(false);
    loadCandidates();
    checkVoteStatus();
    isAdminUser();
  }, [account]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with linear text */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-6xl font-extrabold mb-4 bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Voting DApp
          </h1>
          <p className="text-gray-300 text-lg">
            Decentralized Voting Platform on Blockchain
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 animate-fadeIn">
          <WalletButton account={account} onConnect={connectWallet} />
        </div>

        {/* User Info Card */}
        {account && (
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Role</span>
                <span
                  className={`font-bold text-lg ${
                    isAdmin
                      ? "bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      : "text-white"
                  }`}>
                  {isAdmin ? "👑 Admin" : "👤 User"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">
                  Voting Status
                </span>
                <span
                  className={`font-bold text-lg ${
                    hasVoted
                      ? "bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                      : "bg-linear-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                  }`}>
                  {hasVoted ? "✓ Voted" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Admin Form */}
        {isAdmin && (
          <div className="mb-8 animate-fadeIn">
            <CandidateForm onAddCandidate={addCandidate} loading={loadingAdd} />
          </div>
        )}

        {/* Candidates List */}
        <div className="animate-fadeIn">
          <CandidateList
            candidates={candidates}
            onVote={vote}
            hasVoted={hasVoted}
            canVote={canVote}
          />
        </div>
      </div>
    </div>
  );
}
