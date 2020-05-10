App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    /*$.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });*/

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    if(typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else { 
      // pointing to the blockchain (in this case ganache)
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    
    $.getJSON("Election.json", function(election){
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    })
  },

  listenForEvents: function(){
    App.contracts.Election.deployed().then(function(instance){
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(err, event){
        console.log("event triggered", event);
        App.render();
      });
    });
  },

  /*
  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
  }
  */

  render: function(){
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account){
      if(err == null){
        App.account = account;
        $("#accountAddress").html("Your account " + account);
      }
    });

    App.contracts.Election.deployed().then(function(instance){
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount){
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $("#candidatesSelect");
      candidatesSelect.empty();

      for(var i = 1; i <= candidatesCount; i++){
        electionInstance.candidates(i).then(function(candidate){
          var id = candidate[0];
          var voteCounts = candidate[1];
          var name = candidate[2];

          var candidateTemplate = "<tr><th scope='row'>" + id + "</th><td>" + name + "</td><td>" + voteCounts + "</td></tr>";
          candidatesResults.append(candidateTemplate);

          var candidateOption = "<option value='" + id + "'>" + name + "</option>";
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted){
      if(hasVoted){
        $("form").hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error){
      console.warn(error);
    });
  },

  castVote: function(){
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.vote(candidateId, {from: App.account});
    }).then(function(result){
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err){
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
