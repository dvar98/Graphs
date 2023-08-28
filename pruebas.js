document.addEventListener("DOMContentLoaded", function () {
const graphData = {
    // Estructura de datos de los nodos y relaciones
    // Ejemplo:
    nodes: [
        { id: 0, name: "Tarea 1", duration: 5, cost: 100, prerequisites: [], postrequisites: [2] },
        { id: 2, name: "Tarea 2", duration: 3, cost: 50, prerequisites: [1], postrequisites: [3] },
        { id: 3, name: "Tarea 3", duration: 2, cost: 20, prerequisites: [2], postrequisites: [4] },
        { id: 4, name: "Tarea 4", duration: 4, cost: 80, prerequisites: [3], postrequisites: [5] },
        { id: 5, name: "Tarea 5", duration: 3, cost: 60, prerequisites: [4], postrequisites: [6] },
        { id: 6, name: "Tarea 6", duration: 2, cost: 40, prerequisites: [5], postrequisites: [] },
    ],
    links: [
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

// Crear una simulación de fuerza para los nodos
const simulation = d3.forceSimulation(graphData.nodes)
  .force("charge", d3.forceManyBody().strength(-100))
  .force("link", d3.forceLink(graphData.links).distance(100))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Crear los enlaces (conexiones)
let links = svg.selectAll("line")
  .data(graphData.links)
  .enter().append("line")
  .attr("stroke", "#999")
  .attr("stroke-width", 1);

// Crear los nodos
let nodes = svg.selectAll("circle")
  .data(graphData.nodes)
  .enter().append("circle")
  .attr("r", 10)
  .attr("fill", "blue");

// Agregar etiquetas a los nodos
var nodeLabels = svg.selectAll(".node-label")
  .data(graphData.nodes)
  .enter().append("text")
  .attr("class", "node-label")
  .text(d => d.name)
  .attr("dx", 12)
  .attr("dy", 4);

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

const addNodeButton = document.getElementById("add-node-button");
  if (addNodeButton) {
    addNodeButton.addEventListener("click", openNodePopup);
  }

document.getElementById("add-node-button").addEventListener("click", openNodePopup);

function openNodePopup() {
    const nodeName = prompt("Ingrese el nombre del nuevo nodo:");
    if (nodeName) {
        const newNode = {
          id: graphData.nodes.length + 1,
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
    console.log(graphData.nodes)

    // Actualizar enlaces existentes
    links = svg.selectAll("line")
      .data(graphData.links);
  
    links.exit().remove(); // Eliminar enlaces no utilizados
  
    links = links.enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .merge(links); // Combinar enlaces existentes y nuevos
  
    // Actualizar nodos existentes
    nodes = svg.selectAll("circle")
      .data(graphData.nodes);
  
    nodes.exit().remove(); // Eliminar nodos no utilizados
  
    nodes = nodes.enter().append("circle")
      .attr("r", 10)
      .attr("fill", "blue")
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
      .text(d => d.name)
      .attr("dx", 12)
      .attr("dy", 4)
      .merge(nodeLabels); // Combinar etiquetas de nodos existentes y nuevas
  
    // Actualizar la simulación con los datos actualizados
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
    graphData.links.push({ source: source.id, target: target.id });
    updateVisualization();
  }
}
     

});









    
        
