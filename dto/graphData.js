const descargarBtn = document.getElementById("descargarBtn");

let graphData = {
    // Estructura de datos de los nodos y relaciones
    // Ejemplo:
    nodes: [
        { id: 0, name: "A", duration: 5, cost: 100, prerequisites: [], postrequisites: [1] },
        { id: 1, name: "B", duration: 3, cost: 50, prerequisites: [0], postrequisites: [2] },
        { id: 2, name: "C", duration: 2, cost: 20, prerequisites: [1], postrequisites: [3] },
        { id: 3, name: "D", duration: 4, cost: 80, prerequisites: [2], postrequisites: [4] },
        { id: 4, name: "E", duration: 3, cost: 60, prerequisites: [3], postrequisites: [5] },
        { id: 5, name: "F", duration: 2, cost: 40, prerequisites: [4], postrequisites: [] },
    ],
    links: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 4 },
        { source: 4, target: 5 },

    ],
};