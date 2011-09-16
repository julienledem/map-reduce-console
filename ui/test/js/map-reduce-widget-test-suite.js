/*
Copyright (c) 2011, Yahoo! Inc.  All rights reserved.

Redistribution and use of this software in source and binary forms,
with or without modification, are permitted provided that the following
conditions are met:

* Redistributions of source code must retain the above
  copyright notice, this list of conditions and the
  following disclaimer.

* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the
  following disclaimer in the documentation and/or other
  materials provided with the distribution.

* Neither the name of Yahoo! Inc. nor the names of its
  contributors may be used to endorse or promote products
  derived from this software without specific prior
  written permission of Yahoo! Inc.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

Y.use("node", "node-event-simulate", "console", "test", "curation-map-reduce-console", function (Y) {

    Y.namespace("CurationMapReduceConsoleTest");      
    
    Y.CurationMapReduceConsoleTest.FunctionTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Function Tests",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
            this.mapReduceConsole = Y.CurationMapReduceConsoleTest.TestSuite.mapReduceConsole;
            if(!this.mapReduceConsole.get('rendered')){
                this.mapReduceConsole.render();
            }
            this.functionsDiv = Y.one('#functions');
            this.inputTextArea = Y.one('#in');
            this.inputTextArea.set('value', '');
            this.removeLastButton = Y.one('#removeLastButton');
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
            this.functionsDiv = null;
            this.inputTextArea = null;
            this.removeLastButton = null;
            this.mapReduceConsole = null;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
        
        testMap: function (){
        	var Assert = Y.Assert,
        	    mapButton = this.functionsDiv.one('#mapButton');
        	
        	Assert.isNotUndefined(mapButton);
        	Assert.isNotUndefined(this.inputTextArea);
        	
	        this.inputTextArea.set('value', '"this is example one"\n"another example"\n"yet another one"\n"one more example"');
        	mapButton.simulate("click");
        	
        	var function0 = Y.one('#function_0'),
        	    output0 = Y.one('#output_0');

            Assert.isNotUndefined(function0);
            Assert.isNotUndefined(output0); 
            
            var function0val = function0.get('value');
            Assert.areEqual(function0val, 'function(input){\n'+
	          '  return input;\n}');      	
	          
	        var output0val = output0.get('value');
            Assert.areEqual(output0val, '"this is example one"\n"another example"\n"yet another one"\n"one more example"');   
            
            this.removeLastButton.simulate('click');
        },
        
        testGroupBy: function(){
        	var Assert = Y.Assert,
        	    groupByButton = this.functionsDiv.one('#groupByButton');
        	
        	Assert.isNotUndefined(groupByButton);
        	Assert.isNotUndefined(this.inputTextArea);
        	
	        this.inputTextArea.set('value', '"this is example one"\n"another example"\n"yet another one"');
        	groupByButton.simulate("click");
        	
        	var function0 = Y.one('#function_0'),
        	    output0 = Y.one('#output_0');

            Assert.isNotUndefined(function0);
            Assert.isNotUndefined(output0); 
            
            var function0val = function0.get('value');
            Assert.areEqual(function0val, 'function(input){\n'+
	          '  return input;\n}'); 
	          
	        var expectedOutput = '{\n "key": "this is example one",\n "values": [\n  "this is example one"\n ]\n}\n{\n "key": "another example",\n "values": [\n  "another example"\n ]\n}\n{\n "key": "yet another one",\n "values": [\n  "yet another one"\n ]\n}';
	        var output0val = output0.get('value');
	        Assert.areEqual(expectedOutput, output0val);
	        
	        this.removeLastButton.simulate('click');
        },
        
        testFlatten: function(){
        	var Assert = Y.Assert,
        	    flattenButton = this.functionsDiv.one('#flattenButton');
        	
        	Assert.isNotUndefined(flattenButton);
        	Assert.isNotUndefined(this.inputTextArea);
        	
	        this.inputTextArea.set('value', '"test input"');
        	flattenButton.simulate("click");
        	
        	var output0 = Y.one('#output_0');

            Assert.isNotUndefined(output0); 
            
            var output0val = output0.get('value');        
            Assert.areEqual(output0val, '"t"\n"e"\n"s"\n"t"\n" "\n"i"\n"n"\n"p"\n"u"\n"t"'); 	
            
            this.removeLastButton.simulate('click');
        }, 
        
        testRemoveLast: function(){
        	var Assert = Y.Assert,
        	    groupByButton = this.functionsDiv.one('#groupByButton');
        	
        	Assert.isNotUndefined(groupByButton);
        	Assert.isNotUndefined(this.inputTextArea);
        	
	        this.inputTextArea.set('value', '"this is example one"\n"another example"\n"yet another one"\n"one more example"');
        	groupByButton.simulate("click");
        	
        	var function0 = Y.one('#function_0'),
        	    output0 = Y.one('#output_0');

            Assert.isNotUndefined(function0);
            Assert.isNotUndefined(output0);
        	    
        	this.removeLastButton.simulate('click');
        	    
        	function0 = Y.one('#function_0'),
        	output0 = Y.one('#output_0');

            Assert.isNull(function0);
            Assert.isNull(output0);    	
        },
        
        testSubmit: function(){
            var Assert = Y.Assert,
        	    submitButton = this.functionsDiv.one('#submitToGridButton');
        	    
        	submitButton.simulate('click');
        	
        	var loadingDiv = Y.one('#loading'),
        	    loadingImg = loadingDiv.one('img');
        	    
        	Assert.isInstanceOf(Y.Node, loadingImg);
        }
    
    });  
    
    //create a test suite
    Y.CurationMapReduceConsoleTest.TestSuite = new Y.Test.Suite({
        name : "Curation Map Reduce Widget Test Suite",
 
        setUp : function () {
	        var config = {
		        srcNode: "#curationMapReduceConsole"
	        };
	        this.mapReduceConsole = new Y.CurationMapReduceConsole(config);
	        //this.mapReduceConsole.render();
        },
 
        tearDown: function () {
            this.mapReduceConsole = null;
        }
    });

    Y.CurationMapReduceConsoleTest.TestSuite.add(Y.CurationMapReduceConsoleTest.FunctionTestCase);

    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.CurationMapReduceConsoleTest.TestSuite);

    //run the tests
    Y.Test.Runner.run();

});
