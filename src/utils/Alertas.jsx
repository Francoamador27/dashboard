import Swal from 'sweetalert2';

export const mostrarExito = (mensaje = 'Operación realizada con éxito') => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: mensaje,
    confirmButtonColor: '#2563eb',
  });
};

export const mostrarError = (mensaje = 'Ocurrió un error inesperado') => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonColor: '#dc2626',
  });
};

export const mostrarConfirmacion = async (mensaje = '¿Estás seguro?', texto = 'Esta acción no se puede deshacer') => {
  const result = await Swal.fire({
    title: mensaje,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
};
export const pedirValor = async (
  titulo = 'Ingresá un valor',
  placeholder = 'Escribe aquí...',
  valorPorDefecto = ''
) => {
  const { value } = await Swal.fire({
    title: titulo,
    input: 'text',
    inputPlaceholder: placeholder,
    inputValue: valorPorDefecto,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Tenés que ingresar un valor';
      }
      return null;
    },
  });

  // Si el usuario cancela, value será undefined
  return value ?? null;
};