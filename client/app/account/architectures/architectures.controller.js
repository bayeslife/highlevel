'use strict';

angular.module('highlevelApp')
  .controller('ArchitecturesCtrl', function ($scope, User, Auth, $http, $stateParams, $location, D3Editor , GuidService, BayesNetwork) {
    $scope.errors = {};

    $scope.architectureId = $stateParams.id;
    $scope.categories = [];

    //$scope.width  = 800;
    //$scope.height = 400;
    $scope.centerTransform = 'translate('+$scope.width/2+','+$scope.height/2+')';

    $scope.type='outcome';

    $scope.toggleEdit = function(){
      $scope.architectureEdit = !$scope.architectureEdit;
    }

    $scope.saveArchitecture = function() {      
      $http.put('/api/architecture/'+$scope.architecture._id, $scope.architecture);
      $scope.toggleEdit();            
    };


    $scope.getArchitecture = function(architectureId) {
      $http.get('/api/architecture/'+$scope.architectureId).success(function(c) {
        $scope.architecture = c;
      });
    }

    $scope.getArchitecture($scope.architectureId);

    $scope.refreshCategories = function() {
      $http.get('/api/category').success(function(cats) {
        $scope.categories = cats;      
      });
    }


     $scope.refreshDecisions = function(decisionsId) {
      $http.get('/api/decision/architecture'+$scope.architectureId).success(function(ds) {
        $scope.decisions = ds;      
      });
    }

    $scope.addDecisions = function() {
      if($scope.newDecisions === '') {
        return;
      };
      $http.post('/api/decision', 
      	{ 	name: $scope.newDecision, 
      		choiceId: $scope.choiceId,
      		architectureId: $scope.architectureId 
      	});
      $scope.newDecision = '';
      $scope.refreshDecisions();
    };

    $scope.deleteDecisions = function(c) {
      $http.delete('/api/decision/' + c._id);
      $scope.refreshDecisions();
    };


    $scope.nodename = 'node name';
    //$scope.nodes = [];
    var nodeIndex = 0;
    //$scope.links = [];

    $scope.categories = [];
    $scope.choices=[];
    $scope.capabilities = [];
    $scope.outcomes = [];

    $scope.getCategoryNodes = function(done) {
      $http.get('/api/category?architecture='+$scope.architectureId).success(function(categories) {        
        $scope.categories = categories;
        var cnt = categories.length;
        var i = 0;
        
        for(var i=0;i<categories.length;i++){
          var category = categories[i];
          //category.nodeIndex = nodeIndex++;
          BayesNetwork.addNode(category);
          //$scope.nodes[$scope.nodes.length] = category;
          
          category.color= 1;
          category.reflexive = false;
          //{ id: category._id, name: category.name, color: 1, reflexive: false};
        }
        done();        
                
      });
    }

    $scope.getChoiceNodes = function(done) {      
          $http.get('/api/choice?architecture='+$scope.architectureId).success(function(choices) {

                for(var j=0;j<choices.length;j++){
                  $scope.choices.push(choice);
                  var choice = choices[j];
                  BayesNetwork.addBinaryNode(choice);
                  //choice.nodeIndex=nodeIndex++;
                  //$scope.nodes[$scope.nodes.length] = choice;
                  choice.color =2;
                  choice.reflexive = false;                  

                  // var category = null;
                  // for(var i=0;i<$scope.categories.length;i++){
                  //   if($scope.categories[i]._id === choice.categoryId)
                  //     category = $scope.categories[i];
                  // }
                  //links[links.length] = {source: category.nodeIndex, target: choice.nodeIndex, left: false, right: true };
                };                
                done();
            });                                            
    }


    $scope.getCapabilityNodes = function(done) {      
          $http.get('/api/capability?architecture='+$scope.architectureId).success(function(capabilities) {
              $scope.capabilities = capabilities;
                for(var j=0;j<capabilities.length;j++){
                  var capability = capabilities[j];
                  BayesNetwork.addProbabilityNode(capability);
                  //capability.nodeIndex=nodeIndex++;
                  //$scope.nodes[$scope.nodes.length] = capability;
                  capability.color =4;
                  capability.reflexive = false;                                    
                };                
                done();
            });                                            
    }


    $scope.getOutcomeNodes = function(done) {      
          $http.get('/api/outcome?architecture='+$scope.architectureId).success(function(outcomes) {             
              $scope.outcomes = outcomes;
                for(var j=0;j<outcomes.length;j++){
                  var outcome = outcomes[j];
                  BayesNetwork.addProbabilityNode(outcome);
                  //outcome.nodeIndex=nodeIndex++;
                  //$scope.nodes[$scope.nodes.length] = outcome;
                  outcome.color =3;
                  outcome.reflexive = false;

                };                
                done();
            });                                            
    }


    $scope.getLinks2 = function(done) {      
          $http.get('/api/link?architecture='+$scope.architectureId).success(function(links) {
               for(var j=0;j<links.length;j++){
                  var link = links[j];
                  $scope.delLink(link)
                }
            });
        };

              
    $scope.getLinks = function(done) {      
        $scope.links = [];
          $http.get('/api/link?architecture='+$scope.architectureId).success(function(storedlinks) {

                for(var j=0;j<storedlinks.length;j++){
                  var link = storedlinks[j];
                  if(!BayesNetwork.addLink(link)){
                    $scope.delLink(link)
                  }                  
                };
                BayesNetwork.computeProbability();                
                done();
            });                                     
    }
    
    $scope.addNode = function(done) {
      var node;
      var t = $scope.type;
      var color = 1;
      var probabilityNode = true;
      var binaryNode = false;
      if($scope.type=='category'){
        color = 1;
        probabilityNode = false;
      }else if ($scope.type=='choice'){
        binaryNode = true;
        color = 2;
      } else if ($scope.type=='capability'){
        color = 3;
      } else if ($scope.type=='outcome'){
        color = 4;
      }

      var node = { name: $scope.nodename, type: $scope.type, color: color, reflexive: false, architecture: $scope.architectureId};
      if(probabilityNode)      
        BayesNetwork.addProbabilityNode(node);
      else if(binaryNode){        
        BayesNetwork.addBinaryNode(node);
      }else{
        BayesNetwork.addNode(node);  
      }
      
      $http.post('/api/'+$scope.type, node).success(function(res){
        _.merge(node,res);
        done(node);
      });             
    }  

    $scope.delNode = function(node) {  
      // for(var i=0;i<$scope.links.length;i++){
      //   var link = $scope.links[i];
      //   if(link.sourceId===node._id || link.targetId===node._id)
      //     $scope.delLink(link);
      // }
      BayesNetwork.delNode(node);
      $http.delete('/api/'+node.type+'/' + node._id);          
    } 

    $scope.addLink = function(source,target,done) {      

      var link = {                             
                            sourceId: source._id,
                            source: source.nodeIndex,                            
                            sourceType: source.type,
                            targetId: target._id,
                            target: target.nodeIndex,
                            targetType: target.type,
                            correlation: 0,
                            architecture: $scope.architectureId
                 };

      if( source.type=='category' && target.type=='choice') {
          
      } else if (
        (source.type=='choice' && target.type=='capability') ||
        (source.type=='capability' && target.type=='capability') ||
        (source.type=='capability' && target.type=='outcome') 
        ) {
           
      } else {
        link = null;
        done();
      }
          
      if(link!=null){
          BayesNetwork.addLink(link);
          $http.post('/api/link', link).success(function(res){
              res.source= source.nodeIndex;
              res.target= target.nodeIndex;
              _.merge(link,res);
              done(link);
          });
        }
        
    }

    $scope.delLink = function(link) {
        BayesNetwork.delLink(link);      
        $http.delete('/api/link/' + link._id);      
    } 

    $scope.getCorrelation = function(link,index){
      if(link.correlation)
        return link.correlation;
      else return 0;
    }

    $scope.increaseCorrelation =function(link){
      var r = link.correlation;
      r = r + (1 - r)/3 ;
      link.correlation = r;
      $http.put('/api/link/'+link._id, link);
    }

    $scope.decreaseCorrelation =function(link){
      var r = link.correlation;
      r = r + (-1 - r)/3 ;
      link.correlation = r;
      $http.put('/api/link/'+link._id, link);
    }

    $scope.selectNode = function(node){    
      $scope.nodename = node.name;
      $scope.selectedNode = node;

      if(node.type=='choice') {
        BayesNetwork.selectMutuallyExclusiveNode(node);               
      }      
      BayesNetwork.computeProbability();            
    }

    $scope.deselectNode = function(node){
      $scope.nodename = null;
      $scope.selectedNode = null;            
      
      var siblings=null;
      if(node.type=='choice') {
        var siblings = BayesNetwork.getSiblings(node);               
      }

      $http.put('/api/'+node.type.toLowerCase()+'/'+node._id, node).success(function(){        
        if(siblings!=null)
          for(var i=0;i<siblings.length;i++){
            var sibling = siblings[i];
            $http.put('/api/'+sibling.type.toLowerCase()+'/'+sibling._id, sibling).success(function(){        
            });
          }
      });
      
      BayesNetwork.computeProbability();
      D3Editor.refresh();    
    }

    $scope.getOutcomes = function() {
      var nodes = BayesNetwork.getNodes();
      var outcomes = [];
      for(var i=0;i<nodes.length;i++){
        var node = nodes[i];
        if(node.type.valueOf()==='outcome'.valueOf()){
          outcomes.push(node);
        }
      }
      return outcomes;
    }
    
  BayesNetwork.initialize();
  $scope.getCategoryNodes(function(){
    $scope.getChoiceNodes(function(){
      $scope.getOutcomeNodes(function(){
        $scope.getCapabilityNodes(function(){
            $scope.getLinks(function(){                    
              BayesNetwork.computeProbability();
              var nds = BayesNetwork.getNodes();
              D3Editor.render($location.absUrl(),BayesNetwork, $scope);    
          });
        });
      });
    });    
  })
  

});
