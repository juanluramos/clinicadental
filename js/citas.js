document.addEventListener("DOMContentLoaded", function () {
  //Referencias a elementos del DOM
  const formulario = document.getElementById("form-clientes");
  const contenedorHoras = document.getElementById("horas");
  const inputFecha = document.getElementById("fechaCita");
  const STORAGE_KEY = "citasClinica";

  let citas = [];
  let idCita = parseInt(localStorage.getItem("ultimoIdCita")) || 0;
  let horaSeleccionada = "";

  //Cargar citas previas del localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    citas = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(citas)) citas = [];
  } catch {
    citas = [];
  }



//Editar una cita
  const params = new URLSearchParams(window.location.search);
  const idEditar = params.get("id");
  let modoEdicion = false;
  let citaAEditar = null;

  if (idEditar !== null) {
    modoEdicion = true;

    citaAEditar = citas.find((c) => c.id == idEditar);

    if (citaAEditar) {
      // Rellenar formulario
      document.getElementById("nombre").value = citaAEditar.nombre;
      document.getElementById("apellidos").value = citaAEditar.apellidos;
      document.getElementById("dni").value = citaAEditar.dni;
      document.getElementById("email").value = citaAEditar.email;
      document.getElementById("telefono").value = citaAEditar.telefono;
      document.getElementById("fechaNacimiento").value =citaAEditar.fechaNacimiento;
      document.getElementById("observaciones").value =citaAEditar.observaciones;
      document.getElementById("fechaCita").value = citaAEditar.fechaCita;

      horaSeleccionada = citaAEditar.hora;

      // Crear botones de horas y seleccionar el correcto
      inputFecha.dispatchEvent(new Event("change"));

      setTimeout(() => {
        document.querySelectorAll("#horas button").forEach((btn) => {
          if (btn.value === citaAEditar.hora) {
            btn.classList.add("active");
          }
        });
      }, 100);
    }
  }

  //Array con horarios disponibles
  const horario = [
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00",
  ];

  //Al cambiar la fecha, generamos los botones
  inputFecha.addEventListener("change", function () {
    contenedorHoras.innerHTML = "";

    const citasGuardadas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    horario.forEach((hora) => {
      const boton = document.createElement("button");
      boton.textContent = hora;
      boton.value = hora;
      boton.className = "btn btn-outline-info m-1";
      boton.style.cursor = "pointer";

      // Ver si la hora está ocupada (pero permitimos elegirla si es de la cita que estamos editando)
      const ocupada = citasGuardadas.some(
        (cita) =>
          cita.fechaCita === inputFecha.value &&
          cita.hora === hora &&
          (!modoEdicion || cita.id != idEditar)
      );

      if (ocupada) {
        boton.disabled = true;
        boton.classList.add("btn-secondary");
      } else {
        boton.addEventListener("click", function () {
          document
            .querySelectorAll("#horas button")
            .forEach((b) => b.classList.remove("active"));
          this.classList.add("active");
          horaSeleccionada = this.value;
        });
      }

      contenedorHoras.appendChild(boton);
    });
  });

  // Guardar cita
  formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const dni = document.getElementById("dni").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const observaciones = document.getElementById("observaciones").value;
    const fechaCita = inputFecha.value;

    //Array de errores
    let mensajeError = [];

    // Validaciones
    if (nombre === "") {
      mensajeError.push("El campo NOMBRE no puede estar vacío.");
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/.test(nombre)) {
      mensajeError.push(
        "El NOMBRE sólo puede contener letras y máximos 20 caracteres"
      );
    }
    if (apellidos === "") {
      mensajeError.push("El campo APELLIDOS no puede estar vacío.");
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,30}$/.test(apellidos)) {
      mensajeError.push(
        "Los APELLIDOS sólo pueden contener letras y máximos 30 caracteres"
      );
    }
    if (dni === "") {
      mensajeError.push("El campo DNI no puede estar vacío.");
    } else if (!/^[A-Za-z0-9\s]{1,10}$/.test(dni)) {
      mensajeError.push(
        "El DNI o NIE sólo puede contener letras y números. Máximos 9 caracteres"
      );
    }
    if (email === "") {
      mensajeError.push("El campo EMAIL no puede estar vacío.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      mensajeError.push("Formato de EMAIL incorrecto.");
    }
    if (telefono === "") {
      mensajeError.push("El campo TELÉFONO no puede estar vacío.");
    } else if (!/^[0-9]{9,11}$/.test(telefono)) {
      mensajeError.push(
        "El TELÉFONO solo puede contener números (9 a 11 dígitos)."
      );
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(fechaCita);

    if (fechaCita === "") {
      mensajeError.push("Debes seleccionar una fecha para la cita.");
    } else if (fechaSeleccionada <= hoy) {
      mensajeError.push("La fecha de la cita debe ser posterior a hoy.");
    }

    if (fechaNacimiento === "") {
      mensajeError.push("Debe seleccionar una fecha de nacimiento");
    }

    if (!horaSeleccionada) {
      mensajeError.push("Selecciona una hora para la cita.");
    }

    const divErrores = document.getElementById("errores");

    if (mensajeError.length > 0) {
      divErrores.innerHTML = mensajeError.join("<br>");
      divErrores.classList.remove("d-none");

      setTimeout(() => divErrores.classList.add("visible"), 10);

      setTimeout(() => {
        divErrores.classList.remove("visible");
        setTimeout(() => {
          divErrores.classList.add("d-none");
          divErrores.innerHTML = "";
        }, 500);
      }, 5000);

      return;
    }

//Guardar o actualizar
    if (modoEdicion && citaAEditar) {
      // Actualizar cita existente
      citaAEditar.nombre = nombre;
      citaAEditar.apellidos = apellidos;
      citaAEditar.dni = dni;
      citaAEditar.email = email;
      citaAEditar.telefono = telefono;
      citaAEditar.fechaNacimiento = fechaNacimiento;
      citaAEditar.observaciones = observaciones;
      citaAEditar.fechaCita = fechaCita;
      citaAEditar.hora = horaSeleccionada;

      alert("Cita actualizada correctamente");
    } else {
      // Crear nueva cita
      const nuevaCita = {
        id: idCita,
        nombre,
        apellidos,
        dni,
        email,
        telefono,
        fechaNacimiento,
        observaciones,
        fechaCita,
        hora: horaSeleccionada,
      };

      citas.push(nuevaCita);
      idCita++;
      localStorage.setItem("ultimoIdCita", idCita);

      alert("Cita guardada correctamente");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));

    // Limpieza
    formulario.reset();
    contenedorHoras.innerHTML = "";
    horaSeleccionada = "";
  });
});
