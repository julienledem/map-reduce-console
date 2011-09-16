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

Y.add('curation-map-reduce-console', function(Y){
	
    var isUndefined = Y.Lang.isUndefined,
        isObject    = Y.Lang.isObject,
        isArray     = Y.Lang.isArray,
        isFunction  = Y.Lang.isFunction,
        isNull      = Y.Lang.isNull,
        isString    = Y.Lang.isString,
        isNumber    = Y.Lang.isNumber;
	
	/* constructor */
	var CurationMapReduceConsole = function(config) {
        CurationMapReduceConsole.superclass.constructor.apply(this, arguments);
    }
    
    /* 
     * Required NAME static field, to identify the Widget class and 
     * used as an event prefix, to generate class names etc. (set to the 
     * class name in camel case). 
     */
    CurationMapReduceConsole.NAME = "curation-map-reduce-console";
    
    /*
     * The attribute configuration for the Spinner widget. Attributes can be
     * defined with default values, get/set functions and validator functions
     * as with any other class extending Base.
     */
    CurationMapReduceConsole.ATTRS = {
        // The current value of the spinner.
        input : {
            value:{},
            setter: function(val){
            	this.inputTextArea.set('value', val);
            	this._eventUpdate();
            },
            getter: function(){
            	return this.inputTextArea.get('value');
            }/*,
            validator: function(val) {
                return this._validateValue(val);
            }*/
        },
        
        // The strings for the map reduce console UI. This attribute is 
        // defined by the base Widget class but has an empty value. The
        // spinner is simply providing a default value for the attribute.
        strings: {
            value: {
                mapFunctionLabel: "Map:",
                flattenFunctionLabel: "Flatten",
                groupByFunctionLabel: "Group By:",
                intermediaryOutputLabel: "Intermediary Output:"
            }
        }
    };    
    
    /* Static constant used to identify the classname applied to the spinners value field */
    CurationMapReduceConsole.INPUT_CLASS = Y.ClassNameManager.getClassName(CurationMapReduceConsole.NAME, "input");

    /* Static constants used to define the markup templates used to create Spinner DOM elements */
    //Spinner.INPUT_TEMPLATE = '<input type="text" class="' + Spinner.INPUT_CLASS + '">';
    //Spinner.BTN_TEMPLATE = '<button type="button"></button>';

    /* 
     * The HTML_PARSER static constant is used by the Widget base class to populate 
     * the configuration for the spinner instance from markup already on the page.
     *
     * The Spinner class attempts to set the value of the spinner widget if it
     * finds the appropriate input element on the page.
     */
    CurationMapReduceConsole.HTML_PARSER = {
        //value: function (srcNode) {
            //var val = parseInt(srcNode.get("value")); 
            //return Y.Lang.isNumber(val) ? val : null;
        //}
    };

    /* CurationMapReduceConsole extends the base Widget class */
    Y.extend(CurationMapReduceConsole, Y.Widget, {    
    	/* instance data */
    	good: 'img/check.png',
        bad: 'img/err.png',
        steps: [],
        
        /*
         * initializer is part of the lifecycle introduced by 
         * the Widget class. It is invoked during construction,
         * and can be used to setup instance specific state.
         * 
         */
        initializer: function() {
            // Not doing anything special during initialization
        },

        /*
         * destructor is part of the lifecycle introduced by 
         * the Widget class. It is invoked during destruction,
         * and can be used to cleanup instance specific state.
         * 
         * The map reduce console widget cleans up any node 
         * references it's holding onto. The Widget classes destructor 
         * will purge the widget's bounding box of event listeners, so 
         * spinner only needs to clean up listeners it attaches outside 
         * of the bounding box.
         */
        destructor : function() {
            //this._documentMouseUpHandle.detach();

            this.inputTextArea = null;
            this.inputImage = null;
            this.dataErrorMsg = null;
            this.loadingDiv = null;
            this.inputOutputContainer = null;
            this.farRight = null;
        },

        /*
         * renderUI is part of the lifecycle introduced by the
         * Widget class. Widget's renderer method invokes:
         *
         *     renderUI()
         *     bindUI()
         *     syncUI()
         *
         * renderUI is intended to be used by the Widget subclass
         * to create or insert new elements into the DOM. 
         *
         */
        renderUI : function() {
            //this._renderInput();
            //this._renderButtons();
            var boundingBox = this.get("boundingBox");
            this.inputTextArea = boundingBox.one('#in');
            this.inputImage = boundingBox.one('#inputImage');
            this.dataErrorMsg = boundingBox.one('#dataError');
            this.loadingDiv = boundingBox.one("#loading");
            this.inputOutputContainer = boundingBox.one('#inputOutputContainer');
            this.farRight = boundingBox.one("#farRight");
        },

        /*
         * bindUI is intended to be used by the Widget subclass 
         * to bind any event listeners which will drive the Widget UI.
         * 
         * It will generally bind event listeners for attribute change
         * events, to update the state of the rendered UI in response 
         * to attribute value changes, and also attach any DOM events,
         * to activate the UI.
         * 
         * For spinner, the method:
         *
         * - Sets up the attribute change listener for the "value" attribute
         *
         * - Binds key listeners for the arrow/page keys
         * - Binds mouseup/down listeners on the boundingBox, document respectively.
         * - Binds a simple change listener on the input box.
         */
        bindUI : function() {
            //this.after("valueChange", this._afterValueChange);



            // Looking for a key event which will fire continously across browsers while the key is held down. 38, 40 = arrow up/down, 33, 34 = page up/down
            //var keyEventSpec = (!Y.UA.opera) ? "down:" : "press:";
            //keyEventSpec += "38, 40, 33, 34";

            //Y.on("key", Y.bind(this._onDirectionKey, this), boundingBox, keyEventSpec);
            //Y.on("mousedown", Y.bind(this._onMouseDown, this), boundingBox);
            //this._documentMouseUpHandle = Y.on("mouseup", Y.bind(this._onDocMouseUp, this), boundingBox.get("ownerDocument"));

            //Y.on("change", Y.bind(this._onInputChange, this), this.inputNode);
            
            //this.inputTextArea.on('keyup', Y.bind(this._eventUpdate, this));
            Y.delegate("keyup", Y.bind(this._eventUpdate, this), '#inputOutputContainer', "textarea");
            Y.delegate("click", Y.bind(this._functionButtonClickHandler, this), '#functions', "input");
            Y.delegate("click", Y.bind(this._exampleButtonClickHandler, this), '#examples', "input");
        },   
 
        /*
         * syncUI is intended to be used by the Widget subclass to
         * update the UI to reflect the current state of the widget.
         * 
         * For spinner, the method sets the value of the input field,
         * to match the current state of the value attribute.
         */
        syncUI : function() {
            //this._uiSetValue(this.get("value"));
        },
        
        /*
         * Private Methods (naming convention with underscore as prefix)
         */
        _functionButtonClickHandler : function(e) {
            var button = e.currentTarget,
                buttonId = button.get("id");
                
            if(buttonId == "mapButton")
                this._newMap();
            else if(buttonId == "flattenButton")
                this._newFlatten();
            else if(buttonId == "groupByButton")
                this._newGroupBy();
            else if(buttonId == "removeLastButton")
                this._deleteLastStep();
            else if(buttonId == "submitToGridButton")
                this._submitJS();
               
        },
        
        _exampleButtonClickHandler : function(e){
            var button = e.currentTarget,
                buttonId = button.get("id");
                
            if(buttonId == "wordCountButton")
                this._wordCount();
            else if(buttonId == "entityRelButton")
                this._entityRels();	
        },

        _eventUpdate : function() {
            //var inputData = this.inputTextArea.get('value').split("\n"),
            var inputData = this.get('input').split("\n"),
                inputs = new Array(),
                input;
	        for (var i=0;i<inputData.length;i++) {
		        try {
			        eval('input='+inputData[i]);
			        inputs.push(input);
			        this.inputImage.set('src', this.good);
                    this.dataErrorMsg.set('innerHTML', '');
	            } catch (error) {
	                this.inputImage.set('src', this.bad);
                    this.dataErrorMsg.set('innerHTML', error);
	                return;
	            }
            }
            var boundingBox = this.get("boundingBox"),
                outputNode;
	        for (var i in this.steps) {
		        inputs=this.steps[i].compute(inputs);
		        outputNode = boundingBox.one('#output_'+i);
		        outputNode.set('value', this._toDisplay(inputs));
	        }
        },
         
        _getFunc : function(func_index) {
            try {
                var f, boundingBox = this.get("boundingBox")
	            eval('f='+boundingBox.one('#function_'+func_index).get('value'));
	            boundingBox.one('#functionImage_'+func_index).set('src', this.good);
	            boundingBox.one('#functionError_'+func_index).set('innerHTML', '');
	            return f;
            } catch (error) {
                boundingBox.one('#functionImage_'+func_index).set('src', this.bad);
	            boundingBox.one('#functionError_'+func_index).set('innerHTML', error);
	            throw error;
            }	
        },
        
        _submitJS : function() {
            this.loadingDiv.set('innerHTML', '<img src="img/loading.gif">');
        },
        
        _toDisplay : function(inputs) {
	        var outputData = new Array();
	        for (var i in inputs) {
		        outputData.push(Y.JSON.stringify(inputs[i], undefined, " "));
            }
            return outputData.join("\n");
        },
        
        _insertNewColumn : function(id, html) {
	        var boundingBox = this.get('boundingBox'),
	            parent = this.inputOutputContainer,
	            marker = boundingBox.one("#newColumn"),
	            newColumn = parent.create('<td id="'+id+'"></td>');
	        
	        parent.insertBefore(newColumn, marker);
 	        newColumn.set('innerHTML', html);

            this.farRight.scrollIntoView(true);
        },
        
        _newIntermediaryOutput : function() {
	        var index = this.steps.length - 1;
            this._insertNewColumn('column_'+index+'_output', 
	            '<table>'+
	            '<tr>'+
	            ' <td height=50>'+
	            '   Intermediary Output:'+
	            ' </td>'+
	            '</tr>'+
	            '<tr>'+
	            '	<td>'+
                '		<textarea id="output_'+index+'" rows="38" cols="30" READONLY></textarea>'+
 	            '</td>'+
                '</tr>'+
                '</table>');
        },
        
        _newMap : function() {
	        var index = this.steps.length,
	            that = this;
		    this.steps.push({ type:"map", index:index,
	        compute: function(inputs) {
			    var result = new Array();
		        var f = that._getFunc(this.index);
		        for (i=0; i<inputs.length; i++) {
		            result.push(f(inputs[i]));
		        }
		        return result;
	        }});
	
	        this._insertNewColumn('column_'+index,
	        '<table>'+
	        '<tr>'+
	        ' <td height=50>'+
	        '   Map: <img id="functionImage_'+index+'" src="img/check.png" width=20 height=20>'+
	        ' </td>'+
	        '</tr>'+
	        '<tr>'+
	        '	<td>'+
            '		<textarea id="function_'+index+'" rows="38" cols="40">function(input){\n'+
	        '  return input;\n'+
	        '}</textarea>'+
 	        '</td>'+
            '</tr>'+
	        '<tr>'+
	        ' <td>'+
	        '   <p id="functionError_'+index+'"></p>'+
	        ' </td>'+
	        '</tr>'+
            '</table>');

	        this._newIntermediaryOutput();
	        this._eventUpdate();
        },
        
        _newFlatten : function() {
	        var boundingBox = this.get('boundingBox'),
	            index = this.steps.length;
	        this.steps.push({ type:"flatten", index:index ,
	        compute: function(inputs) {
		        var result = new Array();
		        for (var i=0; i<inputs.length; i++) {
		            for (var j=0; j<inputs[i].length; j++) {
		                result.push(inputs[i][j]);
		            }
		        }
		        return result;
	        }});
	
	        this._insertNewColumn('column_'+index,'Flatten');

	        boundingBox.one('#column_'+index).set('vAlign', "middle");

	        this._newIntermediaryOutput();
	        this._eventUpdate();
        },
        
        _newGroupBy : function() {
	        var index = this.steps.length,
	            that = this;
	        this.steps.push({ type:"GroupBy", index:index ,
	        compute: function(inputs) {
		        var result = new Object();
		        var f = that._getFunc(this.index);
                for (var i=0; i<inputs.length; i++) {
		             var key = f(inputs[i]);
		             var group = result[key];
		             if (group == undefined) {
		                group = {key:key, values:new Array()};
		                result[key] = group;
		             }
		             group.values.push(inputs[i]);
		        }
		        var ret = new Array();
		        for (var key in result) {
                    // alert(key);
			        if (key!="parseJSON" && key!="toJSONString") {
				        ret.push(result[key]);
 			        }
		        }
		        // alert(JSON.stringify(ret));
		        return ret;
	        }});
	
	        this._insertNewColumn('column_'+index,
	        '<table>'+
	          '<tr>'+
	          ' <td height=50>'+
	          '   Group By: <img id="functionImage_'+index+'" src="img/check.png" width=20 height=20>'+
	          ' </td>'+
	          '</tr>'+
	          '<tr>'+
	          '	<td>'+
              '		<textarea id="function_'+index+'" rows="38" cols="40">function(input){\n'+
	          '  return input;\n'+
	          '}</textarea>'+
 	          '</td>'+
              '</tr>'+
	          '<tr>'+
	          ' <td>'+
	          '   <p id="functionError_'+index+'"></p>'+
	          ' </td>'+
	          '</tr>'+
              '</table>');

	        this._newIntermediaryOutput();
	        this._eventUpdate();
        },
        
        _deleteLastStep : function() {
	        var boundingBox = this.get('boundingBox'),
	            index = this.steps.length - 1,
	            c = boundingBox.one('#column_'+index),
	            co = boundingBox.one('#column_'+index+'_output'),
	            parent = this.inputOutputContainer;
	  
	        parent.removeChild(c);
	        parent.removeChild(co);
	        
	        this.steps.splice(index, 1);
	        this._eventUpdate();
        },

        _clearAllColumns : function() {
	        var n = this.steps.length;
	        for (var i=0; i < n; ++i) {
		        this._deleteLastStep();
	        }
        },
        
        _wordCount : function() {
	        this._clearAllColumns();
                //this.inputTextArea.set('value', '"this is example one"\n"another example"\n"yet another one"\n"one more example"');

	        this.set('input', "\"this is example one\"\n\"another example\"\n\"yet another one\"\n\"one more example\"");
	        this._newMap();
	        this.inputOutputContainer.one('#function_0').set('value', 'function(input) {\n  return input.split(" ");\n}');
	        this._newFlatten();
	        this._newGroupBy();
	        this._newMap();
	        this.inputOutputContainer.one('#function_3').set('value', 'function(input) {\n  return {w:input.key,c:input.values.length};\n}');
	        this._eventUpdate();
        },
        
        _entityRels : function() {
	        this._clearAllColumns();
	        //this.set('input', '{"article":1, "entities":[1,2,7]}\n{"article":2, "entities":[2,3]}\n{"article":3, "entities":[2,5,6]}\n{"article":4, "entities":[7]}\n{"article":5, "entities":[7,5,6]}\n{"article":6, "entities":[1,5,6,2]}\n{"article":7, "entities":[6,5]}');
	        this.set('input', "{\"article\":1, \"entities\":[1,2,7]}\n{\"article\":2, \"entities\":[2,3]}\n{\"article\":3, \"entities\":[2,5,6]}\n{\"article\":4, \"entities\":[7]}\n{\"article\":5, \"entities\":[7,5,6]}\n{\"article\":6, \"entities\":[1,5,6,2]}\n{\"article\":7, \"entities\":[6,5]}");
	        this._newMap();//0
	        this.inputOutputContainer.one('#function_0').set('value', 'function(input){\n var entities = input.entities;\n var r = new Array();\n for (var i=0; i<entities.length; i++) {\n  for (var j=0; j<i; j++) {\n   var e1 = entities[i];\n   var e2 = entities[j];\n   if (e1<e2) {\n    r.push({e1:e1,  e2:e2});\n   } else {\n    r.push({e1:e2,  e2:e1});\n   }\n  }\n }\n return r;\n}');
	        this._newFlatten();//1
	        this._newGroupBy();//2
	        this.inputOutputContainer.one('#function_2').set('value', 'function(input){\n return input.e1+","+input.e2;\n}');
	        this._newMap();//3
	        this.inputOutputContainer.one('#function_3').set('value', 'function(input){\n  var k = input.values[0];\n  return [{ e1:k.e1, e2:k.e2, c:input.values.length},\n   { e1:k.e2, e2:k.e1, c:input.values.length}];\n}');
	        this._newFlatten();//4
	        this._newGroupBy();//5
	        this.inputOutputContainer.one('#function_5').set('value', 'function(input){\n  return input.e1;\n}');
	        this._newMap();//6
	        this.inputOutputContainer.one('#function_6').set('value', 'function(input){\n var r = new Array();\n for (var i=0;i<input.values.length;i++) {\n  r.push({entity:input.values[i].e2, score:input.values[i].c});\n }\n return {entity:input.key, related:r};\n}');
	        this._eventUpdate();
        }                 
    });
    
    if(isUndefined(Y.CurationMapReduceConsole))
        Y.namespace("CurationMapReduceConsole");
        
    Y.CurationMapReduceConsole = CurationMapReduceConsole;
    
}, '1.0.0' /* module version */, {
	requires: ['base', 'widget', 'node', 'json', 'event']
});
