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
			assert.equal(candidate1[2], "Candidate 1", "correct candidate name");
		});
	});
})