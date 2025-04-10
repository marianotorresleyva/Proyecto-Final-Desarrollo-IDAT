class RegistroUsuario {
  constructor(formId, selectRolId, mensajeId) {
      this.form = document.getElementById(formId);
      this.selectRol = document.getElementById(selectRolId);
      this.mensaje = document.getElementById(mensajeId);
      this.apiRoles = 'http://localhost:3000/api/roles'; // URL del servicio GET de roles
      this.apiRegistro = 'http://localhost:3000/api/clientes'; // URL del servicio POST para registro

      this.init();
  }

  async init() {
      await this.cargarRoles();
      this.form.addEventListener('submit', (e) => this.registrarUsuario(e));
  }

  async cargarRoles() {
      try {
          const response = await fetch(this.apiRoles);
          if (!response.ok) throw new Error('Error al cargar los roles');

          const roles = await response.json();
          this.selectRol.innerHTML = '<option value="">Seleccione un rol</option>';
          roles.forEach((rol) => {
              const option = document.createElement('option');
              option.value = rol.idRol;
              option.textContent = rol.descripcion;
              this.selectRol.appendChild(option);
          });
      } catch (error) {
          this.mostrarMensaje('Error al cargar los roles: ' + error.message, 'error');
      }
  }

  async registrarUsuario(e) {
      e.preventDefault();

      const datos = {
          nombre: this.form.nombre.value,
          apellido: this.form.apellido.value,
          email: this.form.email.value,
          telefono: this.form.telefono.value,
          direccion: this.form.direccion.value,
          usuario: {
              idRol: parseInt(this.form.idRol.value),
              nomUsuario: this.form.nomUsuario.value,
              password: this.form.password.value,
          },
      };

      try {
          const response = await fetch(this.apiRegistro, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(datos),
          });

          const resultado = await response.json();

          if (response.ok) {
              this.mostrarMensaje('Registro exitoso 🎉', 'exito');
              this.form.reset();
          } else {
              // Mostrar los errores que vienen en el array "errores"
              const errores = resultado.errores.join(', ');
              this.mostrarMensaje('Errores: ' + errores, 'error');
          }
      } catch (error) {
          this.mostrarMensaje('Error de red: ' + error.message, 'error');
      }
  }

  mostrarMensaje(mensaje, tipo) {
      this.mensaje.textContent = mensaje;
      this.mensaje.className = tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error';
  }
}


  // Instancia al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    new RegistroUsuario('formRegistro', 'idRol', 'mensaje');
  });
  