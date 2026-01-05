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
    setIsAdmin(owner.toLowerCase() === account.toLowerCase());
  };

  const addCandidate = async () => {
    const contract = await getContract();
    const tx = await contract.addCandidate(newCandidate);
    await tx.wait();
    setNewCandidate("");
    loadCandidates();
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
  });

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
  });

  useEffect(() => {
    if (!account) return;

    setHasVoted(false);
    setIsAdmin(false);

    loadCandidates();
    checkVoteStatus();
    isAdminUser();
  }, [account]);

  return (
    <div className="p-8">
      {!account ? (
        <>
          <p>Please connect your wallet to participate in the voting.</p>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded">
            Connect Wallet
          </button>
        </>
      ) : (
        <p>Connected: {account}</p>
      )}

      <h2 className="mt-8 text-2xl font-bold">Candidates</h2>
      <ul>
        {candidates.map((c) => (
          <li key={c.id} className="mt-2">
            {c.name} - Votes: {c.voteCount.toString()}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="mt-8">
          <h3 className="text-xl font-bold">Add Candidate</h3>
          <input
            type="text"
            value={newCandidate}
            onChange={(e) => setNewCandidate(e.target.value)}
            className="border p-2 mr-2"
          />
          <button
            onClick={addCandidate}
            className="px-4 py-2 bg-green-600 text-white rounded">
            Add
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-bold">Vote Status</h3>
        {hasVoted ? (
          <p className="mt-2 text-green-600">You have voted.</p>
        ) : (
          <p className="mt-2 text-red-600">You have not voted yet.</p>
        )}
        <p className="mt-2">Role: {isAdmin ? "Admin" : "User"}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold">Vote for Candidate</h3>
        {candidates.map((c) => (
          <button
            key={c.id}
            disabled={hasVoted}
            onClick={() => vote(c.id)}
            className={`px-4 py-2 bg-purple-600 text-white rounded mr-2 mb-2 ${
              canVote ? "" : "opacity-50 cursor-not-allowed"
            }`}>
            Vote for {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
