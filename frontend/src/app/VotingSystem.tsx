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
  const [hasVoted, setHasVoted] = useState(false);
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
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          
          setHasVoted(await contractInstance.methods.hasVoted(accounts[0]).call());
          //events
          const candidateAddedEvent = contractInstance.events.CandidateAdded(
            {}
          );
          const voteCastedEvent = contractInstance.events.VoteCasted({});

          voteCastedEvent.on("data", (data) => {
            console.log(data);
            loadCandidates(contractInstance);
          });
          candidateAddedEvent.on("data", (event) => {
            console.log(event);
            loadCandidates(contractInstance);
          });
          setContract(contractInstance);

          loadCandidates(contractInstance);
          checkVotingStatus(contractInstance);

          // Listen for account changes and reload data
          window.ethereum.on("accountsChanged", async (accounts) => {
            setAccount(accounts[0]);
            setHasVoted(await contractInstance.methods.hasVoted(accounts[0]).call());
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-black text-center mb-6">
          Voting System
        </h1>

        {/* Wallet Connection Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          {account ? (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex-1 truncate">
                <p className="text-sm text-gray-600">Connected:</p>
                <p className="text-sm font-medium text-blue-600 truncate">
                  {account}
                </p>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm w-full sm:w-auto"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 truncate">
              <p className="text-sm text-black font-bold">
                {hasVoted ? (<>You have <span className="text-xl">Voted</span></>) : (<>You have <span className="text-xl">Not Voted</span></>) }
              </p>
            </div>
          </div>
        </div>

        {/* Voting Status */}
        {votingEnded && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            Voting has ended
          </div>
        )}

        {/* Candidates List */}
        {!votingEnded && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Candidates
            </h2>
            <div className="space-y-3">
              {candidates.map((candidate, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-left gap-3"
                >
                  {/* Left-aligned text container */}
                  <div className="flex-1 text-left ml-2">
                    <h3 className="font-medium text-black">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">
                      Votes: {candidate.voteCount}
                    </p>
                  </div>

                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(index)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-sm"
                  >
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {account === "0xe11ff5Ec85b6988B87Bafcd8c46975aF3D346413" &&
          !votingEnded && (
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Add Candidate</h2>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Candidate name"
                    className="p-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddCandidate}
                    className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Candidate
                  </button>
                </div>
              </div>

              <button
                onClick={handleEndVoting}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                End Voting
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
