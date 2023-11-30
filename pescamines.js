function iniciarPartida() {
  var filas = prompt("Introduce el número de filas (mínimo 10, máximo 30):");
  var columnas = prompt("Introduce el número de columnas (mínimo 10, máximo 30):");

  filas = Math.max(10, Math.min(30, parseInt(filas))) || 10;
  columnas = Math.max(10, Math.min(30, parseInt(columnas))) || 10;

  var tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  var tablaHTML = document.createElement("table");
  tablaHTML.style.borderCollapse = "collapse"; // Para unir bordes de celdas

  for (let i = 0; i < filas; i++) {
    var row = document.createElement("tr");
    for (let j = 0; j < columnas; j++) {
      var cell = document.createElement("td");
      cell.setAttribute("data-mina", "false");
      cell.style.width = "23px"; // Tamaño fijo para las celdas
      cell.style.height = "23px"; // Tamaño fijo para las celdas

      var img = document.createElement("img");
      img.src = "img/fons20px.jpg"; // Imagen de fondo para la celda
      img.style.width = "100%";
      img.style.height = "100%";
      cell.appendChild(img);

      // Manejador de clics en la celda
      cell.addEventListener("mousedown", function(event) {
        controlClick(event, this);
      });

      row.appendChild(cell);
    }
    tablaHTML.appendChild(row);
  }

  tabla.appendChild(tablaHTML);

  ponerMinas(tabla, 17);
  calcAdjacents(tabla);
  document.body.appendChild(tabla);
}


function ponerMinas(tabla, porcentaje) {
  const casillasTotales = Array.from(tabla.querySelectorAll("td[data-mina='false']"));
  const nombreCasillasConMina = Math.floor((casillasTotales.length * porcentaje) / 100);

  const randomIndexes = generarIndicesAleatorios(casillasTotales.length, nombreCasillasConMina);
  randomIndexes.forEach(index => casillasTotales[index].setAttribute("data-mina", "true"));
}

function generarIndicesAleatorios(max, cantidad) {
  const indices = [];
  while (indices.length < cantidad) {
    const index = Math.floor(Math.random() * max);
    if (!indices.includes(index)) {
      indices.push(index);
    }
  }
  return indices;
}

function calcAdjacents(tabla) {
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 0; i < filas.length; i++) {
    const columnas = filas[i].getElementsByTagName("td");

    for (let j = 0; j < columnas.length; j++) {
      const casillas = columnas[j];

      if (casillas.getAttribute("data-mina") !== "true") {
        let numMinesAdjacents = 0;

        for (let k = -1; k <= 1; k++) {
          for (let l = -1; l <= 1; l++) {
            const filaAdj = i + k;
            const columnaAdj = j + l;

            if (
              filaAdj >= 0 &&
              filaAdj < filas.length &&
              columnaAdj >= 0 &&
              columnaAdj < filas[filaAdj].getElementsByTagName("td").length &&
              !(k === 0 && l === 0)
            ) {
              const casellaAdj = filas[filaAdj].getElementsByTagName("td")[columnaAdj];
              if (casellaAdj.getAttribute("data-mina") === "true") {
                numMinesAdjacents++;
              }
            }
          }
        }

        casillas.setAttribute("data-num-mines", numMinesAdjacents);
      }
    }
  }
}

function controlClick(event, cell) {
  if (event.button === 0 && !event.shiftKey) {
    realizarAccionPrincipal(cell);
  } else if (event.button === 2) {
    ponerrBandera(cell);
  }
  hasGanado();
}

function realizarAccionPrincipal(cell) {
  const valorMina = cell.getAttribute("data-mina");
  const numMinesAdjacents = cell.getAttribute("data-num-mines");

  valorMina === "true" ? mostraMina(cell) : mostraMinesAdjacents(cell, numMinesAdjacents);
}

function abreCasilla(casilla) {
  const valorMina = casilla.getAttribute("data-mina");
  const numMinesAdjacents = casilla.getAttribute("data-num-mines");

  if (valorMina === "true") {
    mostraMina(casilla);
  } else {
    mostraMinesAdjacents(casilla, numMinesAdjacents);
  }

  hasGanado();
}

function mostraMina(casilla) {
  casilla.classList.add("oberta");
  casilla.getElementsByTagName("img")[0].src = "img/mina20px.jpg";
  mostrarMinas();
}

function mostraMinesAdjacents(casilla, numMinesAdjacents) {
  casilla.classList.add("oberta");

  if (numMinesAdjacents === "0") {
    casilla.style.backgroundColor = "lightgray";
    casilla.innerHTML = ''; // Eliminar cualquier contenido dentro de la celda
    abreCasillasAdjacents(casilla);
  } else {
    casilla.innerText = numMinesAdjacents;
    casilla.style.backgroundColor = ""; // Restaurar el color de fondo predeterminado si no es cero
  }
}

function abreCasillasAdjacents(casilla) {
  const tabla = document.getElementById("tabla");
  const filas = tabla.getElementsByTagName("tr");
  const columnas = filas[0].getElementsByTagName("td").length;

  const filaActual = casilla.parentNode.rowIndex;
  const columnaActual = casilla.cellIndex;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const filaAdj = filaActual + i;
      const columnaAdj = columnaActual + j;

      if (
        filaAdj >= 0 &&
        filaAdj < filas.length &&
        columnaAdj >= 0 &&
        columnaAdj < columnas
      ) {
        const casillaAdj = filas[filaAdj].getElementsByTagName("td")[columnaAdj];

        if (
          !casillaAdj.classList.contains("oberta") &&
          !casillaAdj.classList.contains("bandera")
        ) {
          abreCasilla(casillaAdj);
        }
      }
    }
  }
  
  hasGanado();
}

function hasGanado() {
  const tabla = document.getElementById("tabla");
  const celdasSinMina = tabla.querySelectorAll('td[data-mina="false"]');
  const celdasAbiertas = tabla.querySelectorAll('td.oberta[data-mina="false"]');
  
  // Si todas las celdas sin mina están abiertas, el jugador ha ganado
  if (celdasSinMina.length === celdasAbiertas.length) {
    alert("¡Has ganado!");
  }
}

// Función para revelar las minas en el tablero
function revelarMinas() {
  let casillasConMina = document.querySelectorAll('#tabla [data-mina="true"]');
  casillasConMina.forEach(casilla => {
    casilla.getElementsByTagName("img")[0].src = "img/mina20px.jpg";
  });
}

// Función original con separación de responsabilidades
function mostrarMinas() {
  revelarMinas();
  alert("Has perdido!");
}

// Funció per gestionar la col·locació de la bandera en una cel·la
function ponerrBandera(casilla) {
  const esCerrada = !casilla.classList.contains("oberta");

  if (esCerrada) {
    const tieneBandera = casilla.classList.contains("bandera");

    if (!tieneBandera) {
      casilla.classList.add("bandera");
      casilla.getElementsByTagName("img")[0].src = "img/badera20px.jpg";
    } else {
      casilla.classList.remove("bandera");
      casilla.getElementsByTagName("img")[0].src = "img/fons20px.jpg";
    }
  }
}

