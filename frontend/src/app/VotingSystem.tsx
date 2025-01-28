"use client";
import { useEffect, useState } from "react";
import Web3 from "web3";

const CONTRACT_ADDRESS = "0xd91979b263DAB4e5658415D0663E8dAedFA1a9F6"; // Replace with your contract address
const CONTRACT_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addCandidate",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "candidates",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "voteCount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "endVoting",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCandidate",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "voteCount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCandidatesCount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasVoted",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vote",
    inputs: [
      {
        name: "candidateIndex",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "votingEnded",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CandidateAdded",
    inputs: [
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VoteCasted",
    inputs: [
      {
        name: "voter",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "candidateIndex",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VotingEnded",
    inputs: [],
    anonymous: false,
  },
];

export default function Home() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [votingEnded, setVotingEnded] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          console.log(accounts);
          setAccount(accounts[0]);
  
          const contractInstance = new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          console.log(contractInstance);
          
          setContract(contractInstance);
  
          loadCandidates(contractInstance);
          checkVotingStatus(contractInstance);
  
          // Listen for account changes and reload data
          window.ethereum.on("accountsChanged", async (accounts) => {
            setAccount(accounts[0]);
            loadCandidates(contractInstance);
            checkVotingStatus(contractInstance);
          });
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    };
  
    initWeb3();
  }, []);
  

  const loadCandidates = async (contractInstance) => {
    const count = await contractInstance.methods.getCandidatesCount().call();  
    const candidatesList = [];
    for (let i = 0; i < count; i++) {
      const candidate = await contractInstance.methods.getCandidate(i).call();
      console.log(candidate);
      
      candidatesList.push({
        name: candidate.name,
        voteCount: candidate.voteCount,
      });
    }
    setCandidates(candidatesList);
  };

  const checkVotingStatus = async (contractInstance) => {
    const status = await contractInstance.methods.votingEnded().call();
    setVotingEnded(status);
  };

  const handleVote = async (candidateIndex) => {
    if (!contract || !account) return;
    try {
      await contract.methods.vote(candidateIndex).send({ from: account });
      alert("Vote cast successfully!");
      loadCandidates(contract);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleAddCandidate = async () => {
    if (!contract || !account || !newCandidateName) return;
    try {
      await contract.methods
        .addCandidate(newCandidateName)
        .send({ from: account });
      alert("Candidate added successfully!");
      setNewCandidateName("");
      loadCandidates(contract);
    } catch (error) {
      console.error("Error adding candidate:", error);
    }
  };

  const handleEndVoting = async () => {
    if (!contract || !account) return;
    try {
      await contract.methods.endVoting().send({ from: account });
      alert("Voting ended successfully!");
      setVotingEnded(true);
    } catch (error) {
      console.error("Error ending voting:", error);
    }
  };

  const handleDisconnectWallet = () => {
    setAccount(""); // Clear the connected account
    alert("Wallet disconnected. Please connect a new wallet.");
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]); // Set the new account
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask not detected.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Voting System</h1>

        {/* Display Connected Wallet Address */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow flex justify-between items-center">
          {account ? (
            <>
              <p className="text-sm font-medium text-blue-700">
                Connected Wallet: <span className="font-mono">{account}</span>
              </p>
              <button
                onClick={handleDisconnectWallet}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect Wallet
              </button>
            </>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {votingEnded ? (
          <p className="text-center text-red-500">Voting has ended.</p>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Candidates</h2>
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                  >
                    <span className="font-medium">{candidate.name}</span>
                    <button
                      onClick={() => handleVote(index)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Vote ({candidate.voteCount})
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* lee */}
            {account === "0xe11ff5Ec85b6988B87Bafcd8c46975aF3D346413" && (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Add Candidate (Admin Only)
                  </h2>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                      placeholder="Candidate Name"
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={handleAddCandidate}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleEndVoting}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    End Voting
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
