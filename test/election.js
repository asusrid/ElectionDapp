var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts){

	var electionInstance;

	it("initializes with 2 candidates", function(){
		return Election.deployed().then(function(instance){
			return instance.candidatesCount();
		}).then(function(count){
			assert.equal(count, 2);
		});
	});

	it("initializes candidates with correct values", function(){
		return Election.deployed().then(function(instance){
			electionInstance = instance;
			return electionInstance.candidates(1);
		}).then(function(candidate1){
			assert.equal(candidate1[0], 1, "correct ID");
			assert.equal(candidate1[1], 0, "correct vote count");
			assert.equal(candidate1[2], "Biden", "correct candidate name");
		});
	});

	it("allows a voter to vote", function(){
		return Election.deployed().then(function(instance){
			electionInstance = instance;
			candidateId = 1;
			return electionInstance.vote(candidateId, {from:accounts[0]});
		}).then(function(receipt){
			return electionInstance.voters(accounts[0]);
		}).then(function(voted){
			assert(voted, "the voted had already voted!");
			return electionInstance.candidates(candidateId);
		}).then(function(candidate){
			assert.equal(candidate[1], 1, "increments correctly the votes counts");
		});
	});
});