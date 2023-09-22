const descargarBtn = document.getElementById("descargarBtn");

let graphData = {
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

function descargaGrafo() {

    // Convierte el objeto a una cadena JSON
    var jsonString = JSON.stringify(graphData);

    // Crea un Blob a partir de la cadena JSON
    var blob = new Blob([jsonString], { type: "application/json" });

    // Crea una URL de objeto para el Blob
    var url = URL.createObjectURL(blob);

    // Crea un enlace <a> para descargar el archivo
    var enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = url;
    enlaceDescarga.download = "grafo.json"; // Nombre del archivo

    // Simula un clic en el enlace para iniciar la descarga
    enlaceDescarga.click();

    // Limpia la URL de objeto cuando ya no sea necesaria
    URL.revokeObjectURL(url);
}

function cargarGrafo(){

}