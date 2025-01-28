include .env

CONTRACT = src/MyContract.sol:MyContract
DEPLOY_NETWORK = localhost
DEPLOY_OUTPUT = deploy.log
TRANSACTION_HASH_FILE = tx_hash.txt
ETHERSCAN_API_KEY = FX3N7MQMWKT4N3NJSFHZMTWNN7ICTUMJ5J
CONTRACT_ADDRESS = 0xd91979b263DAB4e5658415D0663E8dAedFA1a9F6
CONTRACT_NAME = VotingSystem
CONTRACT_PATH = src/VotingSystem.sol:VotingSystem
SEPOLIA_RPC_URL = https://sepolia.drpc.org

all: compile

compile:
	forge build
deploy:
	forge create --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) src/VotingSystem.sol:VotingSystem --broadcast
# Verify contract on Sepolia Etherscan
verify:
	forge verify-contract $(CONTRACT_ADDRESS) $(CONTRACT_PATH) \
		--chain-id 11155111 \
		--verifier-url https://api-sepolia.etherscan.io/api \
		--etherscan-api-key $(ETHERSCAN_API_KEY)
tx_hash:
	@grep "Transaction hash:" $(DEPLOY_OUTPUT) | awk '{print $$NF}' > $(TRANSACTION_HASH_FILE)
	@echo "Transaction hash saved to $(TRANSACTION_HASH_FILE)"