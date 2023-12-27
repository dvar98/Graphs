document.addEventListener("DOMContentLoaded", function () {
  const graph_container = document.getElementById("graph-container");

  const all_inputs = document.querySelector("info-box-content input");
  const id_input = document.getElementById("id_input");
  const nombre_input = document.getElementById("nombre_input");
  const costo_input = document.getElementById("costo_input");
  const prerequisito_input = document.getElementById("prerequisito_input");
  const postrequisito_input = document.getElementById("postrequisito_input");

  const duracion_input = document.getElementById("duracion_input");
  const nodoInicio_input = document.getElementById("inicio_input");
  const nodoFin_input = document.getElementById("fin_input");

  const node_attr = "stroke-width: 1; stroke: rgb(51, 51, 51); fill: rgb(161 204 245); cursor: move; r:20;";
  const nodeLabel_attr = "text-anchor: middle; dominant-baseline: central; color: black;";
  const link_attr = "stroke:#444; stroke-width: 5; marker-end:url(#arrowhead)"
  const linkText_attr = "text-anchor: middle; dominant-baseline: central; fill:white;font-size: 14px";
  const linkBack_attr = "cursor: pointer; stroke-width: 1; stroke: rgb(51, 51, 51); fill: rgba(0, 0, 0, 1); color:white; r:15;"

  // Configuración de la visualización
  const width = graph_container.offsetWidth
  const height = graph_container.offsetHeight

  // Crear el lienzo SVG para la visualización
  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("style", `width: ${width - 5}px; height: ${height - 5}px;`)

  // Define el marcador de la flecha
  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10") // Ajusta la vista del marcador
    .attr("refX", 22) // Cambia la posición del marcador en relación con el punto final del camino
    .attr("markerWidth", 3) // Ancho del marcador
    .attr("markerHeight", 3) // Alto del marcador
    .attr("orient", "auto") // Ajusta la orientación automáticamente
    .append("path")
    .attr("d", "M0,-5L10,0L0,5"); // Forma de la flecha

  // Crear un grupo para las líneas de los enlaces
  const linkGroup = svg.append("g").attr("id", "linkGroup");

  // Crear un grupo para los nodos y etiquetas
  const nodeGroup = svg.append("g").attr("id", "nodeGroup");

  // Crear una simulación de fuerza para los nodos
  const simulation = d3.forceSimulation(graphData.nodes)
    .force("charge", d3.forceManyBody().strength(-160))
    .force("link", d3.forceLink(graphData.links).distance(95))
    .force("center", d3.forceCenter(width / 2, height / 2));

  let links, linkBack, linkTexts, nodes, nodeLabels;
  inicializationDraw();


  function inicializationDraw() {
    // Crear y actualizar los enlaces (conexiones)
    links = linkGroup.selectAll(".link")
      .data(graphData.links);

    links.exit().remove(); // Eliminar enlaces no utilizados

    links = links.enter().append("line")
      .attr("class", "link")
      .attr("style", link_attr)
      .merge(links); // Combinar enlaces existentes y nuevos

    //Crear y actualizar fondo de los links-labels
    linkBack = linkGroup.selectAll(".link-back")
      .data(graphData.links);

    linkBack.exit().remove();

    linkBack = linkBack.enter().append("circle")
      .attr("class", "link-back")
      .attr("style", linkBack_attr)
      .merge(linkBack);


    //Crear y actualizar links-labels (duracion)
    linkTexts = linkGroup.selectAll(".link-text")
      .data(graphData.links, d => d.duration);

    linkTexts.exit().remove();

    linkTexts = linkTexts.enter().append("text")
      .text(d => d.duration) // Utiliza la duración del nodo fuente como texto
      .attr("class", "link-text invisible")
      .attr("style", linkText_attr)
      .merge(linkTexts)

    // Crear y actulizar los nodos
    nodes = nodeGroup.selectAll("circle")
      .data(graphData.nodes);

    nodes.exit().remove();

    nodes = nodes.enter().append("circle")
      .attr("class", "graph-node")
      .attr("style", node_attr)
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragEnded))
      .merge(nodes);

    // Crear y actualizar etiquetas a los nodos
    nodeLabels = nodeGroup.selectAll(".node-label")
      .data(graphData.nodes, d => `${d.name}`);

    nodeLabels.exit().remove();

    nodeLabels = nodeLabels.enter().append("text")
      .attr("class", "node-label invisible")
      .attr("style", nodeLabel_attr)
      .merge(nodeLabels)
      .text(d => `${d.name}`); //Texto a colocar en el label

    info();
    adjacencyMatrix();
    incidenceMatrix();
  }

  // Actualizar la simulación en cada fotograma
  simulation.on("tick", () => {
    links
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodes
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    nodeLabels
      .attr("x", d => d.x)
      .attr("y", d => d.y);

    linkBack
      .attr("cx", d => (d.source.x + d.target.x) / 2) // Coloca el texto en el centro del enlace en el eje X
      .attr("cy", d => (d.source.y + d.target.y) / 2); // Coloca el texto en el centro del enlace en el eje Y
    linkTexts
      .attr("x", d => (d.source.x + d.target.x) / 2) // Coloca el texto en el centro del enlace en el eje X
      .attr("y", d => (d.source.y + d.target.y) / 2); // Coloca el texto en el centro del enlace en el eje Y
  });

  // Habilitar arrastre de nodos
  const drag = d3.drag()
    .on("start", dragStarted)
    .on("drag", dragging)
    .on("end", dragEnded);

  // Aplicar la función de arrastre a los nodos
  nodes.call(drag);

  // Funciones de arrastre
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  document.getElementById("add-node-button").addEventListener("click", () => {
    const nodeName = prompt("Ingrese el nombre del nuevo nodo:").toUpperCase();
    const cost = parseInt(prompt("Ingresa costo : "));
    if (nodeName) {
      const newNode = {
        id: graphData.nodes.length,
        name: nodeName,
        cost: cost,
        prerequisites: [],
        postrequisites: []
      };

      graphData.nodes.push(newNode);
      simulation.nodes(graphData.nodes);
      simulation.alpha(1).restart();
      updateVisualization(); // ¡Asegúrate de que esta línea esté presente!
    }
  });


  //Eliminar Nodo
  document.getElementById("delete-node-button").addEventListener("click", () => {
    let deleteNodeName = prompt("Ingrese el nombre del nodo a eliminar:").toUpperCase();

    if (!deleteNodeName) {
      alert('Nombre de nodo no válido');
      return;
    }

    const nodeIndex = graphData.nodes.findIndex(node => node.name == deleteNodeName);

    if (nodeIndex === -1) {
      alert('Nodo no encontrado');
    } else {
      graphData.nodes.splice(nodeIndex, 1);
      graphData.links = graphData.links.filter(link => link.source.id !== nodeIndex && link.target.id !== nodeIndex);

      updateVisualization();
      adjacencyMatrix();
      incidenceMatrix();
    }
  });

  //modificar nodo
  document.getElementById("modify-node-button").addEventListener("click", () => {
    let modifyNodeName = prompt("Ingrese el nombre del nodo a modificar:").toUpperCase();
    const node = graphData.nodes.find(node => node.name == modifyNodeName);
    if (node) {
      node.name = prompt('Ingrese el nombre modificado:').toUpperCase();
      node.cost = parseInt(prompt(`Ingrese el costo del nodo modificado: (Costo Actual: ${node.cost})`));
    } else {
      alert('Nodo no encontrado')
      return
    }
    updateVisualization();
    adjacencyMatrix();
    incidenceMatrix();
  });

  // Agregar aristas
  document.getElementById("add-edge-button").addEventListener("click", () => {
    let sourceNodeName = prompt("Ingrese el nombre del nodo de origen:").toUpperCase();
    let targetNodeName = prompt("Ingrese el nombre del nodo de destino:").toUpperCase();
    let durationLink = parseInt(prompt("Ingrese la duración del nuevo link:"));

    openEdgePopup(sourceNodeName, targetNodeName, durationLink);
  });

  function openEdgePopup(sourceNodeName, targetNodeName, durationLink) {

    sourceNode = graphData.nodes.find(node => node.name == sourceNodeName);
    targetNode = graphData.nodes.find(node => node.name == targetNodeName);

    if (sourceNode && targetNode) {
      // Verificar si el enlace ya existe
      const linkExists = graphData.links.some(link => {
        return (link.source.id === sourceNode.id && link.target.id === targetNode.id);
      });

      // Si no existe, agregarlo
      if (!linkExists) {
        if (sourceNode && targetNode) {
          if (sourceNode.id < targetNode.id) {
            sourceNode.postrequisites.push(targetNode.id);
            targetNode.prerequisites.push(sourceNode.id);
          } else if (sourceNode.id > targetNode.id) {
            targetNode.postrequisites.push(sourceNode.id);
            sourceNode.prerequisites.push(targetNode.id);
          }

          graphData.links.push({ source: sourceNode, target: targetNode, duration: durationLink });
          updateVisualization();
        }
      }
    } else {
      alert("Nodos no encontrados. Asegúrese de ingresar nombres válidos.");
    }
  }

  document.getElementById("delete-edge-button").addEventListener("click", () => {
    let sourceNodeName = prompt("Ingrese el nombre del nodo inicio del arista").toUpperCase();
    let targetNodeName = prompt("Ingrese el nombre del nodo fin del arista").toUpperCase();

    sourceIdNode = graphData.nodes.findIndex(node => node.name == sourceNodeName);
    targetIdNode = graphData.nodes.findIndex(node => node.name == targetNodeName);

    deleteLink(sourceIdNode, targetIdNode)
  })

  function deleteLink(sourceIdNode, targetIdNode) {
    let deletedLink;
    graphData.links = graphData.links.filter(function (link) {
      if (link.source.id !== sourceIdNode) {
        return link
      } else if (link.target.id !== targetIdNode) {
        return link
      } else {
        deletedLink = link
      }
    });
    adjacencyMatrix();
    incidenceMatrix();
    updateVisualization()
    return deletedLink;
  }

  document.getElementById("modify-edge-button").addEventListener("click", () => {
    const sourceNodeName = prompt("Ingrese el nombre del nodo inicio del arista a actualizar").toUpperCase();
    const targetNodeName = prompt("Ingrese el nombre del nodo fin del arista a actualizar").toUpperCase();

    const sourceNameNewLink1 = prompt("Ingrese el nuevo nombre del nodo inicio del arista").toUpperCase();
    const sourceNameNewLink2 = prompt("Ingrese el nuevo nombre del nodo fin del arista").toUpperCase();

    sourceIdNode = graphData.nodes.findIndex(node => node.name == sourceNodeName);
    targetIdNode = graphData.nodes.findIndex(node => node.name == targetNodeName);


    let deletedLink = deleteLink(sourceIdNode, targetIdNode)
    console.log(deletedLink);

    const durationNewLink = parseInt(prompt(`Ingrese la duracion del link (Duracion Actual: ${deletedLink.duration})`))
    openEdgePopup(sourceNameNewLink1, sourceNameNewLink2, durationNewLink)
    
    adjacencyMatrix();
    incidenceMatrix();
    updateVisualization(); // Asegúrate de actualizar la visualización después de modificar los datos
  });

  function updateVisualization() {
    for (let i = 0; i < graphData.nodes.length; i++) {
      graphData.nodes[i].id = i;
    }

    inicializationDraw();

    simulation.nodes(graphData.nodes);
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }

  function info() {
    // nodeLabels
    //   .on("mouseover", (event, d) => {
    //     // Muestra la información del nodo cuando el mouse está sobre él
    //     const tooltip = d3.select("#tooltip");
    //     tooltip.transition().duration(200).style("opacity", .9);
    //     tooltip.html(
    //       `Nombre: ${d.name}
    //       Duración: ${d.duration}
    //       Costo: ${d.cost}
    //       Prerequisito: ${d.prerequisites}
    //       ${d.postrequisites.length > 0 ? "Postrequisito: " + d.postrequisites : ""}`)

    //       .style("left", (event.pageX) + "px")
    //       .style("top", (event.pageY - 28) + "px");
    //   })
    //   .on("mouseout", function (d) {
    //     // Oculta la información cuando el mouse sale del nodo
    //     const tooltip = d3.select("#tooltip");
    //     tooltip.transition().duration(500).style("opacity", 0);
    //   })

    // Muestra la información del nodo cuando el mouse está sobre él
    nodes
      .on("mouseover", (event, d) => {
        // Muestra la información del nodo cuando el mouse está sobre él
        id_input.setAttribute("value", d.id);
        nombre_input.setAttribute("value", d.name);
        costo_input.setAttribute("value", d.cost);
        prerequisito_input.setAttribute("value", d.prerequisites);
        postrequisito_input.setAttribute("value", d.postrequisites);
      })
      .on("mouseout", (d) => {
        // Oculta la información cuando el mouse sale del nodo
        id_input.setAttribute("value", "");
        nombre_input.setAttribute("value", "");
        costo_input.setAttribute("value", "");
        prerequisito_input.setAttribute("value", "");
        postrequisito_input.setAttribute("value", "");
      })

    // Muestra la información del link cuando el mouse está sobre él
    linkBack
      .on("mouseover", (event, d) => {
        duracion_input.setAttribute("value", d.duration);
        nodoInicio_input.setAttribute("value", d.source.id);
        nodoFin_input.setAttribute("value", d.target.id);
      })
      .on("mouseout", (d) => {
        duracion_input.setAttribute("value", "");
        nodoInicio_input.setAttribute("value", "");
        nodoFin_input.setAttribute("value", "");
      })
  }

  // funcion para descargar el grafo actual
  document.getElementById("download-button").addEventListener("click", () => {
    let atributosNodoPermitidos = ["id", "name", "cost", "prerequisites", "postrequisites"];
    let atributosLinkPermitidos = ["source", "target", "duration"];
    let nodes = [];
    let links = [];

    function filtrarAtributos(element, atributosPermitidos) {
      let objetoFiltrado = {};
      Object.keys(element).forEach(function (key) {
        if (atributosPermitidos.includes(key)) {
          objetoFiltrado[key] = element[key];
        }
      });
      return objetoFiltrado;
    }

    graphData.nodes.forEach(element => {
      nodes.push(filtrarAtributos(element, atributosNodoPermitidos));
    });

    graphData.links.forEach(element => {
      let link = filtrarAtributos(element, atributosLinkPermitidos);
      links.push(
        {
          source: link.source.id,
          target: link.target.id,
          duration: link.duration
        });
    });


    let downloadGrafo = {
      nodes: nodes,
      links: links,
    };

    console.log(downloadGrafo);


    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadGrafo));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "graph.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  // Cargar Grafo
  document.getElementById("cargarBtn").addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      graphData = JSON.parse(event.target.result);
      updateVisualization();
      adjacencyMatrix();
      incidenceMatrix();
    };
    reader.readAsText(file);
  });

  //Matriz de Adyacencia
  function adjacencyMatrix() {
    // Elementos en HTML
    const matrixContainer = document.getElementById("adjacency-matrix");
    const table = document.createElement("table");

    // Grafo
    let nodes = simulation.nodes();
    let links = simulation.force.("link").links();

    const numNodes = nodes.length;

    let matriz = new Array(numNodes).fill(null).map(() => new Array(numNodes).fill(0));

    links.forEach(link => {
      let source = link.source.id;
      let target = link.target.id;
      matriz[source][target] = 1;
      matriz[target][source] = 1;
    });

    // Crea la primera fila con encabezados
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // Celda vacía en la esquina superior izquierda
    for (let i = 0; i < numNodes; i++) {
      const headerCell = document.createElement("th");
      headerCell.textContent = nodes[i].name; // Puedes personalizar el encabezado
      headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);

    // Itera sobre la matriz y crea filas y celdas
    for (let i = 0; i < numNodes; i++) {
      const row = document.createElement("tr");
      const nodeHeaderCell = document.createElement("th"); // Crea el encabezado de la fila
      nodeHeaderCell.textContent = nodes[i].name; // Puedes personalizar el encabezado
      row.appendChild(nodeHeaderCell);
      for (let j = 0; j < numNodes; j++) {
        const cell = document.createElement("td");
        cell.textContent = matriz[i][j];
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    // Agrega la tabla al contenedor
    const existingTable = matrixContainer.querySelector("table");
    if (existingTable) {
      matrixContainer.removeChild(existingTable);
    }
    matrixContainer.appendChild(table);
  }


  function incidenceMatrix() {
    // Elementos en HTML
    const matrixContainer = document.getElementById("incidence-matrix");
    const table = document.createElement("table");

    let nodes = simulation.nodes();
    let links = simulation.force("link").links();

    const numNodes = nodes.length;
    const numLinks = links.length;

    let matriz = new Array(numNodes).fill(null).map(() => new Array(numLinks).fill(0));

    links.forEach((link, index) => {
      let source = link.source.id;
      let target = link.target.id;
      matriz[source][index] = 1;
      matriz[target][index] = -1;
    });

    // Crea una fila de encabezado para las aristas
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // Celda vacía en la esquina superior izquierda
    for (let j = 0; j < numLinks; j++) {
      const headerCell = document.createElement("th");
      headerCell.textContent = links[j].source.name + ":" + links[j].target.name; // Puedes personalizar el encabezado
      headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);

    // Itera sobre la matriz y crea filas y celdas
    for (let i = 0; i < numNodes; i++) {
      const row = document.createElement("tr");

      // Crea una celda de encabezado para el nodo
      const nodeHeaderCell = document.createElement("th");
      nodeHeaderCell.textContent = nodes[i].name; // Puedes personalizar el encabezado
      row.appendChild(nodeHeaderCell);

      for (let j = 0; j < numLinks; j++) {
        const cell = document.createElement("td");
        cell.textContent = matriz[i][j];
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    // Aplicar clases de estilo a la tabla y las celdas
    table.classList.add("incidence-table");
    table.querySelectorAll("td").forEach(cell => {
      cell.classList.add("incidence-cell");
    });

    // Elimina la tabla existente y agrega la nueva tabla al contenedor
    const existingTable = matrixContainer.querySelector("table");
    if (existingTable) {
      matrixContainer.removeChild(existingTable);
    }
    matrixContainer.appendChild(table);
  }

  document.getElementById("dijkstra-button").addEventListener("click", () => {
    const startNodeName = prompt("Ingrese el nombre del nodo de inicio para Dijkstra:").toUpperCase();
    const endNodeName = prompt("Ingrese el nombre del nodo de destino para Dijkstra:").toUpperCase();

    const startNode = graphData.nodes.find(node => node.name == startNodeName);
    const endNode = graphData.nodes.find(node => node.name == endNodeName);

    if (startNode && endNode) {
      const { shortestPath, cost } = dijkstra(graphData.nodes, graphData.links, startNode, endNode);
      if (shortestPath !== null) {
        const pathString = shortestPath.map(node => node.name).join(" -> ");
        alert(`El camino más corto desde ${startNode.name} hasta ${endNode.name} es: ${pathString}\nCosto: ${cost}`);
        highlightShortestPath(shortestPath);
      } else {
        alert(`No hay un camino válido desde ${startNode.name} hasta ${endNode.name}`);
      }
    } else {
      alert("Nodos no encontrados. Asegúrese de ingresar nombres válidos.");
    }
  });

  // Función para ejecutar el algoritmo de Dijkstra
  function dijkstra(nodes, links, startNode, endNode) {
    // Inicialización de distancias y nodos visitados
    const distances = new Map();
    const visitedNodes = new Set();
    const previousNodes = new Map();

    nodes.forEach(node => {
      distances.set(node, Infinity);
      previousNodes.set(node, null);
    });

    distances.set(startNode, 0);

    while (visitedNodes.size < nodes.length) {
      const currentNode = getNodeWithShortestDistance(distances, visitedNodes);
      visitedNodes.add(currentNode);

      if (currentNode === endNode) {
        break;
      }

      updateNeighboringNodes(currentNode, links, distances, previousNodes);
    }

    // Calcular el costo total del camino más corto
    let currentNode = endNode;
    let totalCost = 0;

    while (currentNode !== startNode) {
      const previousNode = previousNodes.get(currentNode);
      const link = links.find(link => (link.source === currentNode && link.target === previousNode) || (link.source === previousNode && link.target === currentNode));
      totalCost += link.duration;
      currentNode = previousNode;
    }

    // Reconstruir el camino más corto
    const shortestPath = [];
    currentNode = endNode;
    while (currentNode !== null) {
      shortestPath.unshift(currentNode);
      currentNode = previousNodes.get(currentNode);
    }

    return { shortestPath, cost: totalCost };
  }

  // Función para obtener el nodo con la distancia más corta entre los nodos no visitados
  function getNodeWithShortestDistance(distances, visitedNodes) {
    let shortestDistance = Infinity;
    let closestNode = null;

    distances.forEach((distance, node) => {
      if (!visitedNodes.has(node) && distance < shortestDistance) {
        shortestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  }

  // Función para actualizar las distancias de los nodos vecinos
  function updateNeighboringNodes(currentNode, links, distances, previousNodes) {
    const neighbors = getNeighbors(currentNode, links);

    neighbors.forEach(neighbor => {
      const distance = distances.get(currentNode) + getLinkDistance(currentNode, neighbor, links);
      if (distance < distances.get(neighbor)) {
        distances.set(neighbor, distance);
        previousNodes.set(neighbor, currentNode);
      }
    });
  }

  // Función para obtener los nodos vecinos de un nodo dado
  function getNeighbors(node, links) {
    const neighbors = new Set();
    links.forEach(link => {
      if (link.source === node) {
        neighbors.add(link.target);
      } else if (link.target === node) {
        neighbors.add(link.source);
      }
    });
    return Array.from(neighbors);
  }

  // Función para obtener la distancia entre dos nodos conectados por un enlace
  function getLinkDistance(node1, node2, links) {
    const link = links.find(link => (link.source === node1 && link.target === node2) || (link.source === node2 && link.target === node1));
    return link ? link.duration : Infinity;
  }

  // Función para resaltar el camino más corto en el grafo
  function highlightShortestPath(shortestPath) {
    linkGroup.selectAll(".link").attr("style", link_attr);
    linkGroup.selectAll(".link-back").attr("style", linkBack_attr);

    // Identifica los enlaces que están en la ruta más corta y cambia su estilo
    for (let i = 0; i < shortestPath.length - 1; i++) {
      const sourceNode = shortestPath[i];
      const targetNode = shortestPath[i + 1];

      linkGroup.selectAll(".link")
        .filter(d => (d.source === sourceNode && d.target === targetNode) || (d.source === targetNode && d.target === sourceNode))
        .attr("style", "stroke: #FF0000; stroke-width: 10; marker-end:url(#arrowhead)");

      linkGroup.selectAll(".link-back")
        .filter(d => (d.source === sourceNode && d.target === targetNode) || (d.source === targetNode && d.target === sourceNode))
        .attr("style", "cursor: pointer; stroke-width: 1; stroke: rgb(51, 51, 51); fill: rgba(0, 0, 0, 1); color:white; r:20;");
    }
  }



  document.getElementById("critical-path-button").addEventListener("click", () => {
    const criticalPath = findCriticalPath(graphData.nodes, graphData.links);
    if (criticalPath.length > 0) {
      const criticalPathNames = criticalPath.map(node => node.name).join(" -> ");
      alert(`Ruta crítica: ${criticalPathNames}`);
    } else {
      alert("No se encontró una ruta crítica en el grafo.");
    }
  });

  // Función para encontrar la ruta crítica en un grafo
    document.getElementById("critical-path-button").addEventListener("click", () => {
    const inicio = prompt("Ingrese el nodo de inicio de la ruta crítica:");
    const fin = prompt("Ingrese el nodo de finalización de la ruta crítica:");
  
    if (!inicio || !fin) {
      alert("Debe ingresar nodos de inicio y finalización válidos.");
      return;
    }
  
    const rutaCritica = calcularRutaCritica(inicio, fin);
    if (rutaCritica) {
      const duracionRutaCritica = calcularDuracionRutaCritica(rutaCritica);
      alert(`La ruta crítica es: ${rutaCritica.join(" -> ")}, con una duración de ${duracionRutaCritica}`);
      resaltarRutaCriticaEnGrafo(rutaCritica);
    } else {
      alert("No se encontró una ruta crítica entre los nodos ingresados.");
    }
  });
  
  // Función para calcular la ruta crítica
  function calcularRutaCritica(inicio, fin) {
    const visited = new Set();
    const stack = [];
    const path = [];
  
    // Función recursiva para encontrar la ruta crítica
    function dfs(node) {
      visited.add(node);
      stack.push(node);
  
      if (node === finNode.id) {
        path.push(...stack);
        return true;
      }
  
      for (const neighborId of graphData.nodes[node].postrequisites) {
        if (!visited.has(neighborId)) {
          if (dfs(neighborId)) return true;
        }
      }
  
      stack.pop();
      return false;
    }
  
    dfs(inicioNode.id);
  
    if (path.length === 0) return null;
  
    return path;
  }  
  
  // Función para calcular la duración de la ruta crítica
  function calcularDuracionRutaCritica(rutaCritica) {
    let duracionTotal = 0;
    for (let i = 0; i < rutaCritica.length - 1; i++) {
      const sourceNode = graphData.nodes[rutaCritica[i]];
      const targetNode = graphData.nodes[rutaCritica[i + 1]];
      const link = graphData.links.find((l) => l.source === sourceNode && l.target === targetNode);
      duracionTotal += link.duration;
    }
    return duracionTotal;
  }
  
  // Función para resaltar la ruta crítica en el grafo
  function resaltarRutaCriticaEnGrafo(rutaCritica) {
    links.attr("style", link_attr); // Restablecer estilo de todos los enlaces
  
    for (let i = 0; i < rutaCritica.length - 1; i++) {
      const sourceId = rutaCritica[i];
      const targetId = rutaCritica[i + 1];

      const link = links.filter((d) => d.source.id === sourceId && d.target.id === targetId);

      link.attr("style", "stroke: #0BF107; stroke-width: 5px;");  // Cambiar estilo del enlace
    }
  }
});
