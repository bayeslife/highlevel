'use strict';

describe('Service: BayesNetwork', function () {

  // load the controller's module
  beforeEach(module('highlevelApp'));
  
  var _bayesnetworkService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (BayesNetwork) {
    _bayesnetworkService = BayesNetwork;
  }));

  it('compute probability of single node network', function () {

    expect(_bayesnetworkService).not.toBe(null);

    _bayesnetworkService.addProbabilityNode({name: 'n1'});

    _bayesnetworkService.computeProbability();

    var nodes = _bayesnetworkService.getNodes();
    expect(nodes.length).toBe(1);
    
    expect(nodes[0].probability).toBe(0);

  });

  it('compute probability of 2-node 1-link network', function () {

    expect(_bayesnetworkService).not.toBe(null);

    var n1 = {_id: '1',name: 'n1'};
    _bayesnetworkService.addProbabilityNode(n1);

    var n2 = {_id: '2',name: 'n2'};
    _bayesnetworkService.addProbabilityNode(n2);

    var link = {  sourceId: n1._id,targetId: n2._id };
                            
    expect(_bayesnetworkService.addLink(link)).toBe(true);

    var nodes = _bayesnetworkService.getNodes();
    expect(nodes.length).toBe(2);

    n1=nodes[0];
    n1.probability=0.5

    n2 = nodes[1];
    expect(n2.combinations.length).toBe(2);

    n2.combinations[0].likelihood.value =0.25;
    n2.combinations[1].likelihood.value =0.5;

    _bayesnetworkService.computeProbability();

    expect(nodes[0].probability).toBe(0.5);
    expect(nodes[1].probability).toBe(0.375);

    var links = _bayesnetworkService.getLinks();    

    _bayesnetworkService.delLink(link);

    _bayesnetworkService.computeProbability();    

    expect(nodes[0].probability).toBe(0.5);
    expect(nodes[1].probability).toBe(0.375);
  });

it('compute probability of mutual exclusion', function () {
    
    var n1 = {_id: '1',name: 'category'};
    _bayesnetworkService.addNode(n1);

    var n2 = {_id: '2',name: 'choice1'};
    _bayesnetworkService.addBinaryNode(n2);

    var n3 = {_id: '3',name: 'choice2'};
    _bayesnetworkService.addBinaryNode(n3);

    var link = {  sourceId: n1._id,targetId: n2._id };                            
    expect(_bayesnetworkService.addLink(link)).toBe(true);

    var link2 = {  sourceId: n1._id,targetId: n3._id };                            
    expect(_bayesnetworkService.addLink(link2)).toBe(true);

    var siblings = _bayesnetworkService.getSiblings(n2);
    expect(siblings.length).toBe(1);

    _bayesnetworkService.selectMutuallyExclusiveNode(n2);

    var nodes = _bayesnetworkService.getNodes();
    expect(nodes.length).toBe(3);

    expect(nodes[1].probability).toBe(1);
    expect(nodes[2].probability).toBe(0);
  });

iit('compute probability of 3-node 2-link network', function () {

      var n1 = {_id: '1',name: 'cap1'};
    _bayesnetworkService.addProbabilityNode(n1);

    var n2 = {_id: '2',name: 'cap2'};
    _bayesnetworkService.addProbabilityNode(n2);

    var n3 = {_id: '3',name: 'outcome'};
    _bayesnetworkService.addProbabilityNode(n3);

    var link = {  sourceId: n1._id,targetId: n3._id };                            
    expect(_bayesnetworkService.addLink(link)).toBe(true);

    var link2 = {  sourceId: n2._id,targetId: n3._id };                            
    expect(_bayesnetworkService.addLink(link2)).toBe(true);

    _bayesnetworkService.computeProbability();
                          
    var nodes = _bayesnetworkService.getNodes();
    expect(nodes.length).toBe(3);

    n1=nodes[0];
    n1.probability=1

    n2=nodes[1];
    n2.probability=0

    n3 = nodes[2];
    expect(n3.combinations.length).toBe(4);

    n3.combinations[0].likelihood.value =0.1;//cap1 && cap2
    n3.combinations[1].likelihood.value =0.2;//^cap1 && cap2
    n3.combinations[2].likelihood.value =0.3;//cap1 && ^cap2
    n3.combinations[3].likelihood.value =0.4;//^cap1 && ^cap2

    _bayesnetworkService.computeProbability();
   
    expect(n3.combinations[0].probability).toBe(0);
    expect(n3.combinations[1].probability).toBe(0);
    expect(n3.combinations[2].probability).toBe(0.3);
    expect(n3.combinations[3].probability).toBe(0);

  });

});
