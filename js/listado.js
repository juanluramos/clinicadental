document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "citasClinica";
  const tabla = document.querySelector("#tabla-citas tbody");

  // Leer datos guardados
  const citas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (citas.length === 0) {
    tabla.innerHTML = `<tr>
      <td colspan="8" class="text-muted">No hay citas registradas</td>
      </tr>`;
    return;
  }

  // Crear las filas dinámicamente
  citas.forEach((cita, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${cita.id}</td>
      <td>${cita.nombre}</td>
      <td>${cita.apellidos}</td>
      <td>${cita.dni}</td>
      <td>${cita.fechaCita}</td>
      <td>${cita.hora}</td>
      <td>${cita.telefono}</td>
      <td>
         <button type="button" class="btn btn-outline-primary btn-sm btn-editar">Editar</button>
         <button type="button" class="btn btn-outline-danger btn-sm btn-borrar">Borrar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });

  console.log("📋 Citas cargadas:", citas);

  // Añadir funcionalidad a los botones DESPUÉS de crearlos
  tabla.querySelectorAll(".btn-editar").forEach((btn, index) => {
    btn.addEventListener("click", () => editarCita(index));
  });

  tabla.querySelectorAll(".btn-borrar").forEach((btn, index) => {
    btn.addEventListener("click", () => borrarCita(index));
  });
});

// 🟦 Función para editar cita
function editarCita(index) {
  const STORAGE_KEY = "citasClinica";
  const citas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const cita = citas[index];

  // Redirigir al formulario con el ID real
  window.location.href = "appointment.html?id=" + cita.id;
}

// Función para borrar cita
function borrarCita(index) {
  const STORAGE_KEY = "citasClinica";
  let citas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const cita = citas[index];

  if (confirm(`¿Seguro que quieres eliminar la cita de ${cita.nombre}?`)) {
    citas.splice(index, 1);

    // Guardar cambios
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));

    alert("Cita eliminada correctamente");

    // Borrar la fila visualmente sin recargar
    document.querySelectorAll("#tabla-citas tbody tr")[index].remove();
  }
}
