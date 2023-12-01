// Función para inicializar el tablero del juego
function iniciarPartida() {
  // Solicitar al usuario el número de filas y columnas
  var filas = prompt("Introduce el número de filas (mínimo 10, máximo 30):");
  var columnas = prompt("Introduce el número de columnas (mínimo 10, máximo 30):");

  // Limitar el número de filas y columnas entre 10 y 30
  filas = Math.max(10, Math.min(30, parseInt(filas))) || 10;
  columnas = Math.max(10, Math.min(30, parseInt(columnas))) || 10;

  // Obtener el elemento de la tabla del HTML
  var tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  // Crear un elemento de tabla HTML para representar el tablero
  var tablaHTML = document.createElement("table");
  tablaHTML.style.borderCollapse = "collapse"; // Unir bordes de celdas

  // Crear filas y columnas en la tabla
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

  // Colocar minas en el tablero (porcentaje de minas a colocar)
  ponerMinas(tabla, 17);

  // Calcular la cantidad de minas adyacentes para cada celda
  calcAdjacents(tabla);

  // Agregar el tablero al cuerpo del documento HTML
  document.body.appendChild(tabla);
}

// Función para colocar minas en el tablero
function ponerMinas(tabla, porcentaje) {
  // Obtener todas las celdas que no tienen minas
  const casillasTotales = Array.from(tabla.querySelectorAll("td[data-mina='false']"));
  // Calcular el número de casillas que deben tener minas
  const nombreCasillasConMina = Math.floor((casillasTotales.length * porcentaje) / 100);

  // Generar índices aleatorios para colocar minas en esas posiciones
  const randomIndexes = generarIndicesAleatorios(casillasTotales.length, nombreCasillasConMina);
  randomIndexes.forEach(index => casillasTotales[index].setAttribute("data-mina", "true"));
}

// Función para generar índices aleatorios
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

// Función para calcular el número de minas adyacentes a cada celda
function calcAdjacents(tabla) {
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 0; i < filas.length; i++) {
    const columnas = filas[i].getElementsByTagName("td");

    for (let j = 0; j < columnas.length; j++) {
      const casillas = columnas[j];

      if (casillas.getAttribute("data-mina") !== "true") {
        let numMinesAdjacents = 0;

        // Verificar celdas adyacentes para contar minas
        for (let k = -1; k <= 1; k++) {
          for (let l = -1; l <= 1; l++) {
            const filaAdj = i + k;
            const columnaAdj = j + l;

            // Validar límites y no contar la propia celda
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

// Función que maneja los clics del usuario en las celdas del tablero
function controlClick(event, cell) {
  // Verifica el botón del mouse y si no se presiona la tecla Shift
  if (event.button === 0 && !event.shiftKey) {
    realizarAccionPrincipal(cell); // Ejecuta la acción principal en la celda
  } else if (event.button === 2) {
    ponerBandera(cell); // Coloca o retira una bandera en la celda con clic derecho
  }
  hasGanado(); // Verifica si el jugador ha ganado después de realizar la acción
}

// Realiza la acción principal en la celda (mostrar mina o número de minas adyacentes)
function realizarAccionPrincipal(cell) {
  const valorMina = cell.getAttribute("data-mina");
  const numMinesAdjacents = cell.getAttribute("data-num-mines");

  // Muestra una mina si la celda tiene una, o muestra los números de minas adyacentes
  valorMina === "true" ? mostraMina(cell) : mostraMinesAdjacents(cell, numMinesAdjacents);
}

// Abre la casilla para mostrar la mina o los números de minas adyacentes
function abreCasilla(casilla) {
  const valorMina = casilla.getAttribute("data-mina");
  const numMinesAdjacents = casilla.getAttribute("data-num-mines");

  // Muestra una mina o los números de minas adyacentes en la celda
  if (valorMina === "true") {
    mostraMina(casilla);
  } else {
    mostraMinesAdjacents(casilla, numMinesAdjacents);
  }

  hasGanado(); // Verifica si el jugador ha ganado después de abrir la casilla
}

// Muestra una mina en la celda al hacer clic en una celda con mina
function mostraMina(casilla) {
  casilla.classList.add("oberta");
  casilla.getElementsByTagName("img")[0].src = "img/mina20px.jpg";
  mostrarMinas(); // Muestra todas las minas después de hacer clic en una con mina
}

// Muestra los números de minas adyacentes o abre casillas adyacentes sin minas
function mostraMinesAdjacents(casilla, numMinesAdjacents) {
  casilla.classList.add("oberta");

  // Muestra los números de minas adyacentes o abre casillas adyacentes sin minas
  if (numMinesAdjacents === "0") {
    casilla.style.backgroundColor = "lightgray";
    casilla.innerHTML = ''; // Elimina cualquier contenido dentro de la celda
    abreCasillasAdjacents(casilla); // Abre las casillas adyacentes sin minas
  } else {
    casilla.innerText = numMinesAdjacents;
    casilla.style.backgroundColor = ""; // Restaura el color de fondo predeterminado si no es cero
  }
}

// Abre casillas adyacentes sin minas recursivamente
function abreCasillasAdjacents(casilla) {
  // Obtiene información sobre el tablero y la celda actual
  const tabla = document.getElementById("tabla");
  const filas = tabla.getElementsByTagName("tr");
  const columnas = filas[0].getElementsByTagName("td").length;

  const filaActual = casilla.parentNode.rowIndex;
  const columnaActual = casilla.cellIndex;

  // Recorre las celdas adyacentes a la celda actual
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const filaAdj = filaActual + i;
      const columnaAdj = columnaActual + j;

      // Verifica límites del tablero y abre las celdas adyacentes sin minas ni banderas
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
  
  hasGanado(); // Verifica si el jugador ha ganado después de abrir las casillas adyacentes
}

// Verifica si el jugador ha ganado el juego
function hasGanado() {
  const tabla = document.getElementById("tabla");
  const celdasSinMina = tabla.querySelectorAll('td[data-mina="false"]');
  const celdasAbiertas = tabla.querySelectorAll('td.oberta[data-mina="false"]');
  
  // Si todas las celdas sin mina están abiertas, muestra un mensaje de victoria
  if (celdasSinMina.length === celdasAbiertas.length) {
    alert("¡Has ganado!");
  }
}

// Función para revelar las minas en el tablero cuando el jugador pierde
function revelarMinas() {
  let casillasConMina = document.querySelectorAll('#tabla [data-mina="true"]');
  casillasConMina.forEach(casilla => {
    casilla.getElementsByTagName("img")[0].src = "img/mina20px.jpg";
  });
}

// Función original para mostrar todas las minas cuando el jugador pierde
function mostrarMinas() {
  revelarMinas(); // Revela todas las minas en el tablero
  alert("Has perdido!"); // Muestra un mensaje de derrota al jugador
}

// Función para manejar la colocación o eliminación de una bandera en una celda
function ponerBandera(casilla) {
  const esCerrada = !casilla.classList.contains("oberta");

  if (esCerrada) {
    const tieneBandera = casilla.classList.contains("bandera");

    // Coloca una bandera o la elimina de la celda según su estado actual
    if (!tieneBandera) {
      casilla.classList.add("bandera");
      casilla.getElementsByTagName("img")[0].src = "img/badera20px.jpg";
    } else {
      casilla.classList.remove("bandera");
      casilla.getElementsByTagName("img")[0].src = "img/fons20px.jpg";
    }
  }
}