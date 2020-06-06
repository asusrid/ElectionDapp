App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
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

    return App.initWeb3();
  },

  initWeb3: function() {
    
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
        fromBlock: 'latest',
        toBlock: 'latest'
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
    console.log("Llega");

    App.contracts.Election.deployed().then(function(instance){
      electionInstance = instance;
      return electionInstance.time();
    }).then(function(time){
      App.timer(time);
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
  },

  timer: function(duration){

    var timer = duration;
    var hourS, minuteS, secondS;
    setInterval(function () {
      hourS = parseInt((timer /3600)%24, 10)
      minuteS = parseInt((timer / 60)%60, 10)
      secondS = parseInt(timer % 60, 10);

      hourS = hourS < 10 ? "0" + hourS : hourS;
      minuteS = minuteS < 10 ? "0" + minuteS : minuteS;
      secondS = secondS < 10 ? "0" + secondS : secondS;

      time = (hourS + ":" + minuteS + ":" + secondS);
      $("#remainingTime").html(time);

      --timer;

    }, 1000);
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
