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


Y.use('curation-map-reduce-console', 'yui2-connection', 'yui2-datasource', 'yui2-treeview', 'yui2-logger', function(Y){
	
	var YAHOO = Y.YUI2;
	
	var channelsDS = new YAHOO.util.DataSource("assets/hdfs-channels.php",{
        responseType : YAHOO.util.DataSource.TYPE_XML,
		useXPath: true,
		doBeforeCallback : function (req,raw,res,cb) {
		            // This is the filter function
		            /*var data     = res.results || [],
		                filtered = [],
		                i,l, searchText, ofInterestOnly, interested, name, desc, owner;

		            if (req) {
		                searchText = req.text.toLowerCase();
		                ofInterestOnly = req.ofInterest;
		               
		                for (i = 0, l = data.length; i < l; ++i) {
		                	interested = data[i].of_interest === "true" || data[i].of_interest === true ? true : false;
		                	if(ofInterestOnly && !interested)
		                		continue;
		                	
		                	name = data[i].name.toLowerCase();
		                	desc = data[i].description.toLowerCase();
		                	owner = data[i].owner.toLowerCase();
		                	if(searchText === '')
		                        filtered.push(data[i]);
		                	else{
		                		if(name.search(searchText) != -1 || desc.search(searchText) != -1 || owner.search(searchText) != -1)
		                			filtered.push(data[i]);
		                	}
		                }
		                res.results = filtered;
		            }*/
            var listItems = raw.childNodes[0].childNodes,
                files = [], i, j, attrs;//[0].attributes

            for(i in listItems){
            	if(listItems[i].localName != 'file')
            	    continue;
            	else{
            		attrs = listItems[i].attributes;
            		for(j in attrs){
            			if(attrs[j].localName == 'path')
            			    files.push(attrs[j].nodeValue);
            		}
            	}    
            }

            res.files = files;
		    return res;
        }
    });
    
    channelsDS.responseSchema = {
        metaFields: {
        	root:"/listing/@path"
        },
        resultNode: "directory",
        fields: [{key:"path", locator:"@path"}]
    };
    
    var tree;
    
    var createFolderSubtree = function(currentPath, root, files){
    	var res,
    	    currFolder, subPath,
    	    child, file, filePath, fileName;
 
        if(currentPath.search('/') < 0){
        	res = {
    		    type: 'text',
    		    label: currentPath
    	    };
    	    currFolder = currentPath;
        }else{
            currFolder = currentPath.split('/')[0];
    	    res = {
    		    type: 'text',
    		    label: currFolder
    	    };
    	
    	    subPath = currentPath.split(currFolder+'/')[1];    
    	    child = createFolderSubtree(subPath, root+'/'+currFolder, files);
    	}
    	
    	if(child){
    		res.children = [];
    	    res.children.push(child);
    	}
    	    
        for(var j in files){
            filePath = files[j];
            if(filePath.search(root+'/'+currFolder) == 0){
                fileName = filePath.split(root+'/'+currFolder+'/')[1];
            	if(fileName.search('/') >= 0)
            	    continue;
            			                    			         
                if(!res.children)
            	    res.children = [];            			         
            			         			    
                file = {
                    type: 'text',
            		label: fileName,
            		className: 'file-picker-file-node'
            	};
            		
            	res.children.push(file); 
            }
    	}
    	
    	return res;
    };
    
    var mergeFolders = function(f1, f2){
    	var res = f1, i, j, label1, label2, 
    	    unique, isFolder, 
    	    c1 = res.children, 
    	    c2 = f2.children;
    	
    	for(i in c2){
    		unique = true;
    		isFolder = false;
    		label1 = c2[i].label;
    		
    		for(j in c1){
    			label2 = c1[j].label;
    			if(label1 == label2){
    				unique = false;
    				if(c2[i].children != null || c1[j].children != null){
    					isFolder = true;
    				}
    				break;
    			}
    		}
    		
    		if(unique){
    	        c1.push(c2[i]);
    		}else if(isFolder){
                c1[j] = mergeFolders(c1[j], c2[i]);
    		}
    	}
    	
    	res.children = c1;
    	return res;
    };
    
    var getChannelsSuccessCB = function(sRequest, oResponse, oPayload){
    	if(oResponse){
    		var treeData,
    		    treeNode, dirPath, children, filePath, fileName, file,
    		    files = oResponse.files, 
    		    dirs = oResponse.results, i,
    		    root = oResponse.meta.root;
    		    
    		treeData = {
    		    type: 'text',
    		    label: root	
    		};
    		
    		treeData.children = []; 		
    		
            for(i in dirs){
            	if(dirs[i].path == root)
            	    continue;

            	dirPath = dirs[i].path.split(root+'/')[1];
            	
            	treeNode = createFolderSubtree(dirPath, root, files, treeData);
            	
            	treeData.children.push(treeNode); 
            }
            
            var merged = {}, folders = treeData.children, folder, folderLabel;
            
            for(i in folders){
            	folder = folders[i];
            	folderLabel = folder.label;
            	
                if(!merged[folderLabel]){
                	merged[folderLabel] = folder;
                	continue;
                }else{
                	merged[folderLabel] = mergeFolders(merged[folderLabel], folder);
                }
            }
            
            treeData.children = [];
            for(i in merged){
            	treeData.children.push(merged[i]);
            }
            
            tree = new YAHOO.widget.TreeView("filePickerTree", [treeData]);
            //tree = new YAHOO.widget.TreeView("filePickerTree", [merged]);
            tree.render();        
            tree.subscribe('clickEvent', Y.bind(nodeClickEventHandler, this));
        }
    };
    
    var getChannelsFailureCB = function(sRequest, oResponse, oPayload){
    	if(oResponse){
    		
    	}
    };    
    
    channelsDS.sendRequest(null,
    {
        success : getChannelsSuccessCB,
		failure : getChannelsFailureCB,
		scope   : this,
		argument: {}
    });	   
    
	var config = {
		srcNode: "#curationMapReduceConsole"
	};
	
	var mapReduceConsole = new Y.CurationMapReduceConsole(config);
    mapReduceConsole.render();
	//mapReduceConsole.set('input', "\"this is example one\"\n\"another example\"\n\"yet another one\"\n\"one more example\"");
	
    var nodeClickEventHandler = function(event){
    	// Only update input if file is picked
    	if(event.node.className == 'file-picker-file-node'){
            if(!mapReduceConsole)
                return;
                
            mapReduceConsole.set('input', "\"Maui\"\n\"Kaui\"\n\"Oahu\"\n\"Honolulu\"");
            
    	}
    };
	
});
