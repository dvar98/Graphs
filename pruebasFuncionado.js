document.addEventListener("DOMContentLoaded", function () {
  const graphData = {
    // Estructura de datos de los nodos y relaciones
    // Ejemplo:
    nodes: [
      { id: 0, name: "0", duration: 5, cost: 100, prerequisites: [], postrequisites: [1] },
      { id: 1, name: "1", duration: 3, cost: 50, prerequisites: [0], postrequisites: [2] },
      { id: 2, name: "2", duration: 2, cost: 20, prerequisites: [1], postrequisites: [3] },
      { id: 3, name: "3", duration: 4, cost: 80, prerequisites: [2], postrequisites: [4] },
      { id: 4, name: "4", duration: 3, cost: 60, prerequisites: [3], postrequisites: [6] },
      { id: 5, name: "5", duration: 2, cost: 40, prerequisites: [4], postrequisites: [] },
    ],
    links: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },

    ],
  };
  // Configuración de la visualización
  const width = 800;
  const height = 600;

  // Crear el lienzo SVG para la visualización
  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Crear un grupo para las líneas de los enlaces
  const linkGroup = svg.append("g").attr("id", "linkGroup");

  // Crear un grupo para los nodos y etiquetas
  const nodeGroup = svg.append("g").attr("id", "nodeGroup");

  // Crear una simulación de fuerza para los nodos
  const simulation = d3.forceSimulation(graphData.nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force("link", d3.forceLink(graphData.links).distance(100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Crear los enlaces (conexiones)
  let links = linkGroup.selectAll(".link")
    .data(graphData.links)
    .enter().append("line")
    .attr("class", "link")
    .attr("stroke", "#666")
    .attr("stroke-width", 3);


  // Crear los nodos
  let nodes = nodeGroup.selectAll(".node")
    .data(graphData.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 20)
    .attr("fill", "rgb(0, 100, 199)")
    .attr("style", "stroke-width: 2; stroke: rgb(51, 51, 51); fill: rgb(0, 100, 199); cursor: move;")
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragging)
      .on("end", dragEnded));

  // Agregar etiquetas a los nodos
  let nodeLabels = nodeGroup.selectAll(".node-label")
    .data(graphData.nodes)
    .enter().append("text")
    .attr("class", "node-label")
    .text(d => d.id)
    .attr("style", "text-anchor: middle; dominant-baseline: central;cursor: pointer; fill: white;")

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

  infoTiempoLink()
  infoNode()

  const addNodeButton = document.getElementById("add-node-button");
  if (addNodeButton) {
    addNodeButton.addEventListener("click", openNodePopup);
  }

  document.getElementById("add-node-button").addEventListener("click", openNodePopup);

  function openNodePopup() {
    const nodeName = prompt("Ingrese el nombre del nuevo nodo:");
    if (nodeName) {
      const newNode = {
        id: graphData.nodes.length,
        name: nodeName,
        duration: 0,
        cost: 0,
        prerequisites: [],
        postrequisites: []
      };

      graphData.nodes.push(newNode);
      simulation.nodes(graphData.nodes);
      simulation.alpha(1).restart();
      updateVisualization(); // ¡Asegúrate de que esta línea esté presente!
    }

  }

  function updateVisualization() {
    // Actualizar enlaces existentes
    links = linkGroup.selectAll("line")
      .data(graphData.links);

    links.exit().remove(); // Eliminar enlaces no utilizados

    links = links.enter().append("line")
      .attr("class", "link")
      .attr("stroke", "#666")
      .attr("stroke-width", 3)
      .merge(links); // Combinar enlaces existentes y nuevos

    // Actualizar nodos existentes
    nodes = nodeGroup.selectAll("circle")
      .data(graphData.nodes);

    nodes.exit().remove(); // Eliminar nodos no utilizados

    nodes = nodes.enter().append("circle")
      .attr("r", 20)
      .attr("style", "stroke-width: 2; stroke: rgb(51, 51, 51); fill: rgb(0, 100, 199); cursor: move;")
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragEnded))
      // .on("click", nodeClicked)
      // .on("contextmenu", nodeContextMenu) // Agregar menú contextual
      .merge(nodes); // Combinar nodos existentes y nuevos

    // Actualizar etiquetas de nodos existentes
    nodeLabels = svg.selectAll(".node-label")
      .data(graphData.nodes);

    nodeLabels.exit().remove(); // Eliminar etiquetas no utilizadas

    nodeLabels = nodeLabels.enter().append("text")
      .attr("class", "node-label")
      .text(d => d.id)
      .attr("style", "text-anchor: middle; dominant-baseline: central;cursor: pointer; fill: white;")
      .merge(nodeLabels); // Combinar etiquetas de nodos existentes y nuevas

    // Actualizar la simulación con los datos actualizados
    infoNode()
    infoTiempoLink()

    simulation.nodes(graphData.nodes);
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }



  // Configurar el evento click para agregar aristas
  const addEdgeButton = document.getElementById("add-edge-button");
  if (addEdgeButton) {
    addEdgeButton.addEventListener("click", openEdgePopup);
  }

  function openEdgePopup() {
    let sourceNodeId = prompt("Ingrese el ID del nodo de origen:");
    let targetNodeId = prompt("Ingrese el ID del nodo de destino:");

    sourceNode = graphData.nodes.find(node => node.id === parseInt(sourceNodeId));
    targetNode = graphData.nodes.find(node => node.id === parseInt(targetNodeId));

    if (sourceNode && targetNode) {
      addLink(sourceNode, targetNode);
    } else {
      alert("Nodos no encontrados. Asegúrese de ingresar IDs válidos.");
    }
  }

  // Función para agregar un enlace entre dos nodos
  function addLink(source, target) {
    // Verificar si el enlace ya existe
    const linkExists = graphData.links.some(link => {
      return (link.source === source.id && link.target === target.id);
    });

    // Si no existe, agregarlo
    if (!linkExists) {
      if (source.id < target.id) {
        graphData.nodes[source.id].postrequisites.push(target.id)
        graphData.nodes[target.id].prerequisites.push(source.id)
      } else if (source.id > target.id) {
        graphData.nodes[target.id].postrequisites.push(source.id)
        graphData.nodes[source.id].prerequisites.push(target.id)
      }

      graphData.links.push({ source: source.id, target: target.id });
      updateVisualization();
    }
  }

  // Configurar el evento click para mostrar los prerequisitos de un nodo y los postrequisitos
  const showPrerequisitesAndPostrequisitesButton = document.getElementById("show-prerequisites-and-postrequisites-button");
  if (showPrerequisitesAndPostrequisitesButton) {
    showPrerequisitesAndPostrequisitesButton.addEventListener("click", showPrerequisitesAndPostrequisites);
  }

  //Funcion que muestre los prerequisitos de un nodo y los postrequisitos
  function showPrerequisitesAndPostrequisites() {
    let nodeId = prompt("Ingrese el ID del nodo:");
    let node = graphData.nodes.find(node => node.id === parseInt(nodeId));

    if (node) {
      alert("Prerequisitos: " + node.prerequisites + "\nPostrequisitos: " + node.postrequisites);
    } else {
      alert("Nodo no encontrado. Asegúrese de ingresar un ID válido.");
    }
  }

  // Configurar el evento click para mostrar el costo total de un nodo
  const showTotalCostButton = document.getElementById("show-total-cost-button");
  if (showTotalCostButton) {
    showTotalCostButton.addEventListener("click", showTotalCost);
  }

  //Funcion que muestre el costo total de un nodo
  function showTotalCost() {
    let nodeId = prompt("Ingrese el ID del nodo:");
    let node = graphData.nodes.find(node => node.id === parseInt(nodeId));

    if (node) {
      alert("Costo total: " + node.cost);
    } else {
      alert("Nodo no encontrado. Asegúrese de ingresar un ID válido.");
    }
  }

  function infoNode() {
    nodeLabels
      .on("mouseover", function (event, d) {
        // Muestra la información del nodo cuando el mouse está sobre él
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html("Información del nodo: " + d.id + " Prerequisito:" + d.prerequisites + " Postrequisito:" +
          d.postrequisites + " Costo:" + d.cost)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        // Oculta la información cuando el mouse sale del nodo
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(500).style("opacity", 0);
      })
  }

  // Mostar el tiempo total de la ruta de cada nodo enciam de los links
  function infoTiempoLink() {
    links
      .on("mouseover", function (event, d) {
        // Muestra la información del nodo cuando el mouse está sobre él
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html("Tiempo total de la ruta: " + d.target.duration + " días")
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        // Oculta la información cuando el mouse sale del nodo
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(500).style("opacity", 0);

      });
  }
});