'use strict';

angular.module('highlevelApp')
  .factory('BayesNetwork', function BayesNetwork($rootScope) {

    var POSITIVE='1';
    var NEGATIVE='0';

    var nodes=[];
    var links=[];
    var nodeIndex = 0;
  
    // Public API here
    return {

      initialize: function() {
        nodes = [];
        links= [];
        nodeIndex =0;
      },

      getNodes: function() {
        return nodes;
      },
      getLinks: function() {
        return links;
      },

      addProbabilityNode: function(node){      
        node.probabilityNode=true;
        this.addNode(node)
      },
      addBinaryNode: function(node){        
        node.binaryNode=true;
        this.addNode(node);        
      },
      addNode: function(node){  
        node.nodeIndex = nodeIndex++;      
        nodes.push(node);
      },   
      delNode: function(node){
        for(var i=0;i<links.length;i++){
          var link = links[i];
          if(link.sourceId===node._id || link.targetId===node._id)
            return true;
        }
        return false;
      },      
      addLink: function(link){
        var s,t;
        for(var i=0;i< nodes.length;i++){
          if(nodes[i]._id === link.sourceId)
            s = nodes[i];
          if(nodes[i]._id === link.targetId)
            t = nodes[i];
        }
        if(s!=null && t !=null){

          link.source = s.nodeIndex;
          link.target = t.nodeIndex;
          link.left = false;
          link.right = true;
          links.push(link);          
          return true;
        }else {
          return false;         
        }
      },
      setupLink: function(link){
        var s,t;
        for(var i=0;i< nodes.length;i++){
          if(nodes[i]._id === link.sourceId)
            s = nodes[i];
          if(nodes[i]._id === link.targetId)
            t = nodes[i];
        }
        if(s!=null && t !=null){        
          this.setupProbabilityDistribution(s,nodes,links);
          this.setupProbabilityDistribution(t,nodes,links);          
        }
      },
      delLink: function(link){
        for(var i=0;i<links.length;i++){
          var l = links[i];
          if(l.sourceId===link.sourceId && l.targetId===link.targetId){
            links.pop(i);
          }
        }
        var s,t;
        for(var i=0;i< nodes.length;i++){
          if(nodes[i]._id === link.sourceId)
            s = nodes[i];
          if(nodes[i]._id === link.targetId)
            t = nodes[i];
        }
        if(s!=null && t !=null){          
          this.setupProbabilityDistribution(s,nodes,links);
          this.setupProbabilityDistribution(t,nodes,links);
        }
      },
     
      computeProbability: function(){        

        for(var i=0;i<nodes.length;i++){
          var node = nodes[i];
          node.computed=false;
          this.setupProbabilityDistribution(node,nodes,links);
        }
        var cntNodesToCompute = nodes.length;
        var cntPreviousNodesToCompute;
        do {
          cntPreviousNodesToCompute = cntNodesToCompute;
          for(var i=0;i<nodes.length;i++){
            var node = nodes[i];
            if(!node.computed){
              if(this.canComputeNode(node,nodes,links)){
                this.computeNodeProbability(node,nodes,links);
                node.computed=true;                
              }
            }
          }
          cntNodesToCompute = this.countNodesToCompute(nodes);
        } while(cntNodesToCompute>0 && cntNodesToCompute!=cntPreviousNodesToCompute)        
      },

      countNodesToCompute: function(nodes){
        var cnt = 0;
        for(var i=0;i<nodes.length;i++){
            var node = nodes[i];
            if(!node.computed)
              cnt++;
        }
        return cnt;
      },

      canComputeNode: function(node, nodes,links){                                        
          var sourceNodes = this.computeSourceNodes(node,nodes,links);
          for(var i=0;i<sourceNodes.length;i++){
            var sourceNode = sourceNodes[i];          
            if(!sourceNode.computed)
              return false
          }
          return true;
      },

      computeNodeProbability: function(node, nodes,links){     
        if(!node.probabilityNode){
          //its a category node
          console.log(node.name +' probability is not required');
          return;
        }    
        if(node.combinations.length==0){
          if(node.probability===undefined){
            node.probability=0;
            console.log(node.name +' probability initialized to '+node.probability);
          }else{
            //its a node without any source nodes
            console.log(node.name +' probability retained as '+node.probability);
          }
          return;
        }
          
        for(var i=0;i<node.combinations.length;i++){
            var combination = node.combinations[i];
            this.computeCombinationPrior(combination,nodes); 
            var prior = combination.prior.value;
            var likelihood = combination.likelihood.value;
            //console.log(combination.combinationName);
            //console.log(likelihood);
            //console.log(prior);
            combination.probability = prior* likelihood;    
        }

        var p = 0;
        for(var i=0;i<node.combinations.length;i++){
            var combination = node.combinations[i];            
            p = p + combination.probability;                      
          }
          node.probability = p;
          console.log(node.name +' probability set to '+node.probability);        
      },


      computeCombinationPrior: function(combination,nodes){
        combination.prior.value=1;        
        for(var i=0;i<combination.variables.length;i++){
            var variable = combination.variables[i];
            var sourcenode = this.getNode(variable._id,nodes);
            if(variable.negate){
              combination.prior.value=combination.prior.value * (1-sourcenode.probability);
            }else{
              combination.prior.value=combination.prior.value * sourcenode.probability;  
            }          
        }    
      },

      computeSourceNodes: function(node,nodes,links){
        var sourceNodes = [];
        for(var i=0;i < links.length;i++){
          var l = links[i];
          if(l.targetId == node._id){                
            for(var j=0;j < nodes.length;j++){
              var candidate = nodes[j];
              if(candidate.probabilityNode && l.sourceId == candidate._id)
                sourceNodes.push(nodes[j]);
            }   
          }
        }
        return sourceNodes;
      },

      setupProbabilityDistribution: function(node,nodes,links){          
          var sourceNodes = this.computeSourceNodes(node,nodes,links);
          var originalCombinations = node.combinations;
          node.combinations = this.combinations(0,node,sourceNodes);          
          for(var i=0;i<node.combinations.length;i++){
            var combination = node.combinations[i];  

            combination._id = this.getCombinationId(combination);
            this.setupCombinationName(combination);
            this.setupPriorName(combination);
            this.setupJointName(node,combination);
            this.setupLikelihoodName(node,combination);            

            if(originalCombinations){
              var key = this.getCombinationId(combination);
              for(var j=0;j<originalCombinations.length;j++){
                var originalCombination = originalCombinations[j];
                var key2 = this.getCombinationId(originalCombination);
                if(key==key2){
                  combination.likelihood.value=0;
                  if(originalCombination.hasOwnProperty('likelihood'))
                    if(originalCombination.likelihood.hasOwnProperty('value'))
                      combination.likelihood.value = originalCombination.likelihood.value;
                }
              }
            }
          }          
      },

      combinations: function (offset,node,nodes){
        var combinationsOptimized = [];

        var combinationsExhaustive =  this.combinationsExhaustive(offset,node,nodes); 
        for(var i=0;i<combinationsExhaustive.length;i++){
          var combination = combinationsExhaustive[i];        
            {
              var cnt=0;
              for(var j=0;j<combination.variables.length;j++){
                var variable = combination.variables[j];
                var nd=  this.getNode(variable._id,nodes);              
                if(!variable.negate && nd.binaryNode)
                  cnt++;            
              }
              if(cnt===1)
                combinationsOptimized.push(combination);
            }
            {
              var nonbinarysource=false
              for(var j=0;j<combination.variables.length;j++){
                var variable = combination.variables[j];
                var nd=  this.getNode(variable._id,nodes);              
                if(!nd.binaryNode)
                  nonbinarysource=true;          
              }
              if(nonbinarysource)
                combinationsOptimized.push(combination);
            }        
        }
        return combinationsOptimized;
      },

      combinationsExhaustive: function (offset,node,nodes){
        var result = [];
        var combination;
        var n = nodes[offset];   
        var variables;
        var variable;
        if(nodes.length==0){   
            return result;        
        }else if(offset==nodes.length-1){            
            variables = [];
            variable = { nodeName: n.name , _id: n._id };
            variables.push(variable);
            combination = { variables: variables };            
            result.push( combination );
          
            variables = [];
            variable = { nodeName: n.name , _id: n._id ,negate: true };
            variables.push(variable);
            combination = { variables:  variables };           
            result.push(  combination );            
        }else {
            var r = this.combinationsExhaustive(offset+1,node,nodes);             
            for(var i=0;i<r.length;i++){                
                variables = r[i].variables.slice();                
                variables.push( { nodeName: n.name , _id: n._id } );
                combination = { variables:  variables };
                result.push( combination);

                variables = r[i].variables.slice();
                variables.push( { nodeName: n.name , _id: n._id , negate: true } );
                combination = { variables:  variables };
                result.push( combination);    
            }
        }
        return result;
      },

      getSiblings: function(node){
        var siblings = [];        
        var parentNode = null;                
        for(var i=0;i < links.length;i++){
          var l = links[i];
          if(l.targetId == node._id){                
            for(var j=0;j < nodes.length;j++){
              var candidate = nodes[j];
              if(l.sourceId == candidate._id)
                parentNode = candidate;
            }   
          }
        }
        if(parentNode!=null){
          //console.log("parent node:"+parentNode.name);
          for(var i=0;i < links.length;i++){
            var l = links[i];
            //console.log("link targetid:"+l.targetId)
            if(l.sourceId == parentNode._id){                
              for(var j=0;j < nodes.length;j++){
                var candidate = nodes[j];
                //console.log('candidate:'+candidate.name);
                if(l.targetId == candidate._id && candidate._id!=node._id)                  
                  siblings.push(candidate);
              }   
            }
          }          
        }
        return siblings;
      },

      selectMutuallyExclusiveNode: function(node){
        var siblings = this.getSiblings(node);
        node.probability=1;
        console.log(node.name+" probability set to 1");
        for(var i=0;i<siblings.length;i++){
          var sibling = siblings[i];
          sibling.probability = 0;
          console.log(sibling.name+" probability set to 0");
        }
      },


      setupCombinationName: function(combination){
        var answer='';
        for(var j=0;j<combination.variables.length-1;j++){
              var variable = combination.variables[j];
              var presentation = (variable.negate ? '^' :'') + variable.nodeName;
              answer= answer + presentation +' & ';
            }
        var variable = combination.variables[combination.variables.length-1];
        var presentation = (variable.negate ? ' ^' :'') + variable.nodeName;
        answer= answer + presentation;
        combination.combinationName = answer;
      },

      setupPriorName: function(combination){        
        combination.prior={};
        combination.prior.name ='P('+combination.combinationName+')';      
      },

      setupJointName: function(node,combination){
        var answer='P('+node.name+' & ';
        combination.jointName = answer + combination.combinationName+')';      
      },

      setupLikelihoodName: function(node,combination){    
          combination.likelihood = {};
          combination.likelihood.name='P('+node.name+' | ' + combination.combinationName+')';            
      },
       
      getCombinationId: function(combination){
          var answer='';
          for(var i=0;i<combination.variables.length-1;i++){
            var v = combination.variables[i];
            answer = answer + (v.negate ? '0_' : '1_') + v._id+'-';
          }
          var v = combination.variables[combination.variables.length-1];
          answer = answer + (v.negate ? '0_' : '1_') + v._id;
          return answer;
      },

      getNode: function(nodeId,nodes){            
            for(var j=0;j<nodes.length;j++){
              if(nodes[j]._id==nodeId){
                return nodes[j];    
              }
            } 
        }
    };        
});
