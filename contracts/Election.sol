pragma solidity ^0.5.16;

contract Election {

	struct Candidate {
		uint id;
		uint voteCount;
		string name;
	}

	mapping(uint => Candidate) public candidates;
	mapping(address => bool) public voters;

	uint public candidatesCount;
	uint public time;

	event votedEvent (
		uint indexed _candidateId
	);

	constructor() public {
    	addCandidate("Biden");
    	addCandidate("Trump");
    	setTime(1 days);
  	} 

  	function addCandidate(string memory _name) private {
  		candidatesCount ++;
  		candidates[candidatesCount] = Candidate(candidatesCount, 0, _name);
  	}

  	function vote(uint _candidateId) public {
  		require(!voters[msg.sender]);
  		require(_candidateId > 0 && _candidateId <= candidatesCount);
  		voters[msg.sender] = true;
  		candidates[_candidateId].voteCount ++;

  		emit votedEvent(_candidateId);
  	}

  	function setTime(uint _time) public {
  		time = _time;
  	}

}
