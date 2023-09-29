const descargarBtn = document.getElementById("descargarBtn");

let graphData = {
    // Estructura de datos de los nodos y relaciones
    // Ejemplo:
    nodes: [
        { id: 0, name: "A", cost: 100, prerequisites: [], postrequisites: [1] },
        { id: 1, name: "B", cost: 50, prerequisites: [0], postrequisites: [2] },
        { id: 2, name: "C", cost: 20, prerequisites: [1], postrequisites: [3] },
        { id: 3, name: "D", cost: 80, prerequisites: [2], postrequisites: [4] },
        { id: 4, name: "E", cost: 60, prerequisites: [3], postrequisites: [5] },
        { id: 5, name: "F", cost: 40, prerequisites: [4], postrequisites: [] },
    ],
    links: [
        { source: 0, target: 1, duration: 5 },
        { source: 1, target: 2, duration: 3 },
        { source: 2, target: 3, duration: 2 },
        { source: 3, target: 4, duration: 4 },
        { source: 4, target: 5, duration: 3 },
    ],
};