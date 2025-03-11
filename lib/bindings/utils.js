var edge_list = {};
window.selectedNode = null;

function neighbourhoodHighlight(params) {
  // console.log("in nieghbourhoodhighlight");
  allNodes = nodes.get({ returnType: "Object" });
  allEdges = edges.get({ returnType: "Object" });

  if (edge_list) {
    for (let edge of Object.values(edge_list)) {
      if (edge.from.includes('.')){
        edges.update({id: edge.id, hidden:true})
      }
    }
    edge_list = {};
  }
  
  // Code to update the filter & displayed content on manual node selection
  let isUpdatingFilter = false;  // Prevent loop
  network.on("click", function (params) {
    if (params.nodes.length > 0) {
      let selectedNodeID = params.nodes[0]; // Get the selected Node

      if (selectedNodeID.includes('.')) {
        let selectElement = document.getElementById("name-filter");
        let newValue = selectedNodeID.split('.')[1];

        if (selectElement.value !== newValue) {
          isUpdatingFilter = true;  // Block event trigger
          selectElement.value = newValue;
          filterName();
          setTimeout(() => isUpdatingFilter = false, 100);  // Reset flag
        } 
      }
    }
    else {
      // If nothing is selected then set value to NONE
      let selectElement = document.getElementById("name-filter");
      let newValue = "None";

      if (selectElement.value !== newValue) {
        isUpdatingFilter = true;
        selectElement.value = newValue;
        filterName();
        setTimeout(() => isUpdatingFilter = false, 100);
      }
    }
  });

  // originalNodes = JSON.parse(JSON.stringify(allNodes));
  // if something is selected:
  if (params.nodes.length > 0) {
    highlightActive = true;
    var i;
    window.selectedNode = params.nodes[0];
    var selectedNode = window.selectedNode;
    console.log(window.selectedNode);

    // console.log('Utils initial: '+window.filterCheck);
    // if (!window.filterCheck) {
    //   if (typeof filterName === "function") {
    //     window.filterCheck = true;
    //     console.log('Set to True: '+window.filterCheck);
    //     filterName(); // Calls the function from the HTML page
    //   } 
    //   else {
    //     console.error("Function is not defined!");
    //   }
    // }

    // mark all nodes as hard to read.
    for (let nodeId in allNodes) {
      // nodeColors[nodeId] = allNodes[nodeId].color;
      allNodes[nodeId].color = "rgba(200,200,200,0.5)";
      if (allNodes[nodeId].hiddenLabel === undefined) {
        allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
        allNodes[nodeId].label = undefined;
      }
    }

    underwriter = selectedNode.split('.')[1];
    // var connectedNodes = network.getConnectedNodes(selectedNode);
    var allConnectedNodes = [];

    allConnectedNodes = Object.entries(allNodes).filter(([key,value]) => String(key).includes(underwriter)).map(([key, value]) => key);

    // Highlight all the center nodes whose underwriters are highlighted
    let uniqueNodes = new Set(allConnectedNodes);
    for (let n of uniqueNodes) {
      let same_source = n.split('.')[0];
      if (!uniqueNodes.has(same_source)) {
        allConnectedNodes.push(same_source);
      }
    }
    // console.log(allConnectedNodes);

    for (i = 0; i < allConnectedNodes.length; i++) {
      // allNodes[connectedNodes[i]].color = undefined;
      allNodes[allConnectedNodes[i]].color = nodeColors[allConnectedNodes[i]];
      if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[allConnectedNodes[i]].label =
          allNodes[allConnectedNodes[i]].hiddenLabel;
        allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // ✅ Identify the latest job from underwriterList
    // var currentJobNode = underwriterList.find(job => job.includes(underwriter));
    // // console.log(currentJobNode);

    // for (i = 0; i < allConnectedNodes.length; i++) {
    //   let node = allConnectedNodes[i];
    //   if (node.includes('.') && node !== currentJobNode) {
    //     allNodes[node].color = '#94949E'; // Dark gray for previous jobs
    //   }
    // }

    // the main node gets its own color and its label back.
    // allNodes[selectedNode].color = undefined;
    // allNodes[selectedNode].color = nodeColors[selectedNode];
    // if (allNodes[selectedNode].hiddenLabel !== undefined) {
    //   allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
    //   allNodes[selectedNode].hiddenLabel = undefined;
    // }

    // Makes the edges associated with the selected node visible
    for(let connectNode of allConnectedNodes){
      for(let edge of Object.values(allEdges)){
        if (
          (edge.from === selectedNode && edge.to === connectNode)
          ||
          (edge.to === selectedNode && edge.from === connectNode)
        ) {
          edges.update({id: edge.id, hidden:false});
          edge_list[edge.id] = edge;
        }
      }
    }
    for (let nodeA of allConnectedNodes) {
      for (let nodeB of allConnectedNodes) {
        if (nodeA !== nodeB) {
          for (let edge of Object.values(allEdges)) {
            if (
              (edge.from === nodeA && edge.to === nodeB)
              ||
              (edge.to === nodeA && edge.from === nodeB)
            ) {
              edges.update({id: edge.id, hidden:false});
              edge_list[edge.id] = edge;
            }
          }
        }
      }
    }
     // console.log(edge_list);

    // Iterate through all nodes and increase size of those highlighted
    let uniqueSizes = new Set();
    
    for (let nodeid in allNodes){
      if (allNodes.hasOwnProperty(nodeid)){
        let size = allNodes[nodeid].size;
        uniqueSizes.add(size);
      }
    }

    let distinctSizeCount = uniqueSizes.size;

    if (distinctSizeCount === 2) {
      for (let nodeid of allConnectedNodes) {
        var nodesize = allNodes[nodeid].size;
        allNodes[nodeid].size = nodesize * 1.5;
      }
    }

    // Auto zoom on all highlighted nodes
    // Track whether zooming is happening manually
    let isManualZoom = false;

    // Detect manual zooming or panning
    network.on("zoom", function () {
        isManualZoom = true;
    });
    network.on("dragEnd", function () {
        isManualZoom = true;
    });

    // if (!isManualZoom) {
    //   if (allConnectedNodes.length > 0) {
    //     console.log('Some Issue if prints more than 1');
    //     network.fit({nodes: allConnectedNodes, animation: {duration: 1000, easingFunction: "easeInOutQuad"}});
    //   }
    //   else {
    //     // If no connections, just zoom to the selected node
    //     network.focus(window.selectedNode, {
    //       scale: 1.5,
    //       animation: {duration: 1000, easingFunction: "easeInOutQuad"}
    //     });
    //   }
    // }
    // // Reset zoom tracking flag **only when a new node is selected**
    // network.on("click", function (params) {
    //   if (params.nodes.length > 0) {
    //       isManualZoom = false;  // Allow auto-zoom again when a new selection is made
    //   }
    // });

  } 
  else if (highlightActive === true) {
    // console.log("highlightActive was true");
    // reset all nodes
    for (let nodeId in allNodes) {
      // allNodes[nodeId].color = "purple";
      allNodes[nodeId].color = nodeColors[nodeId];
      // delete allNodes[nodeId].color;
      if (allNodes[nodeId].hiddenLabel !== undefined) {
        allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
        allNodes[nodeId].hiddenLabel = undefined;
      }
    }
    // Get nodes to normal size
    for (let node in allNodes) {
      if (!node.includes('.')) {
        allNodes[node].size = 30
      }
      else {
        allNodes[node].size = 10
      }
    }

    // console.log(edge_list);
    // Hide all the edges that were made visible
    for (let edge of Object.values(edge_list)) {
      if (edge.from.includes('.')){
        edges.update({id: edge.id, hidden:true})
      }
    }
    edge_list = {};
    highlightActive = false;
  }
  // ------------------------------------------
  // transform the object into an array
  var updateArray = [];
  if (params.nodes.length > 0) {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        // console.log(allNodes[nodeId]);
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  } else {
    // console.log("Nothing was selected");
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        // console.log(allNodes[nodeId]);
        // allNodes[nodeId].color = {};
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  }
}

function filterHighlight(params) {
  allNodes = nodes.get({ returnType: "Object" });
  // if something is selected:
  if (params.nodes.length > 0) {
    filterActive = true;
    let selectedNodes = params.nodes;

    // hiding all nodes and saving the label
    for (let nodeId in allNodes) {
      allNodes[nodeId].hidden = true;
      if (allNodes[nodeId].savedLabel === undefined) {
        allNodes[nodeId].savedLabel = allNodes[nodeId].label;
        allNodes[nodeId].label = undefined;
      }
    }

    for (let i=0; i < selectedNodes.length; i++) {
      allNodes[selectedNodes[i]].hidden = false;
      if (allNodes[selectedNodes[i]].savedLabel !== undefined) {
        allNodes[selectedNodes[i]].label = allNodes[selectedNodes[i]].savedLabel;
        allNodes[selectedNodes[i]].savedLabel = undefined;
      }
    }

  } else if (filterActive === true) {
    // reset all nodes
    for (let nodeId in allNodes) {
      allNodes[nodeId].hidden = false;
      if (allNodes[nodeId].savedLabel !== undefined) {
        allNodes[nodeId].label = allNodes[nodeId].savedLabel;
        allNodes[nodeId].savedLabel = undefined;
      }
    }
    filterActive = false;
  }

  // transform the object into an array
  var updateArray = [];
  if (params.nodes.length > 0) {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  } else {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  }
}

function selectNode(nodes) {
  network.selectNodes(nodes);
  neighbourhoodHighlight({ nodes: nodes });
  return nodes;
}

function selectNodes(nodes) {
  network.selectNodes(nodes);
  filterHighlight({nodes: nodes});
  return nodes;
}

function highlightFilter(filter) {
  let selectedNodes = []
  let selectedProp = filter['property']
  if (filter['item'] === 'node') {
    let allNodes = nodes.get({ returnType: "Object" });
    for (let nodeId in allNodes) {
      if (allNodes[nodeId][selectedProp] && filter['value'].includes((allNodes[nodeId][selectedProp]).toString())) {
        selectedNodes.push(nodeId)
      }
    }
  }
  else if (filter['item'] === 'edge'){
    let allEdges = edges.get({returnType: 'object'});
    // check if the selected property exists for selected edge and select the nodes connected to the edge
    for (let edge in allEdges) {
      if (allEdges[edge][selectedProp] && filter['value'].includes((allEdges[edge][selectedProp]).toString())) {
        selectedNodes.push(allEdges[edge]['from'])
        selectedNodes.push(allEdges[edge]['to'])
      }
    }
  }
  selectNodes(selectedNodes)
}