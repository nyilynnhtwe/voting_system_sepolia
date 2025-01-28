// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract VotingSystem {
    struct Candidate {
        string name;
        uint voteCount;
    }
    address public admin;
    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    bool public votingEnded;

    event CandidateAdded(string name);
    event VoteCasted(address voter, uint candidateIndex);
    event VotingEnded();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier votingActive() {
        require(!votingEnded, "Voting has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) external onlyAdmin votingActive {
        candidates.push(Candidate(_name, 0));
        emit CandidateAdded(_name);
    }

    function vote(uint candidateIndex) external votingActive {
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");

        hasVoted[msg.sender] = true;
        candidates[candidateIndex].voteCount++;

        emit VoteCasted(msg.sender, candidateIndex);
    }

    function endVoting() external onlyAdmin votingActive {
        votingEnded = true;
        emit VotingEnded();
    }

    function getCandidatesCount() external view returns (uint) {
        return candidates.length;
    }

    function getCandidate(
        uint index
    ) external view returns (string memory name, uint voteCount) {
        require(index < candidates.length, "Invalid candidate index");
        Candidate memory candidate = candidates[index];
        return (candidate.name, candidate.voteCount);
    }
}