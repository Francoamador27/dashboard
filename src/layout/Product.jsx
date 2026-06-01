import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { TrashIcon } from '@heroicons/react/24/outline';
import getCroppedImg from '../utils/cropImage';
import Resumen from '../components/Resumen';
import useCont from '../hooks/useCont';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { mostrarError } from '../utils/Alertas';
import Swal from 'sweetalert2';

const Product = () => {
  const { handleAgregarPedido, handleAddCart, producto, pedido } = useCont();

  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [sameImage, setSameImage] = useState(false);
  const [images, setImages] = useState(Array(1).fill(null));
  const [croppedImages, setCroppedImages] = useState(Array(1).fill(null));
  const [subtotal, setSubtotal] = useState(null);
  const [reglasDescuento, setReglasDescuento] = useState([]);
  useEffect(() => {
    const obtenerReglas = async () => {
      try {
        const response = await clienteAxios('/api/cart-discounts');
        setReglasDescuento(response.data?.data || []);
      } catch (error) {
        console.error('Error cargando reglas de descuento:', error);
      }
    };
    obtenerReglas();
  }, []);
  useEffect(() => {
    const obtenerSubtotal = async () => {
      const res = await calcularSubtotal();
      setSubtotal(res);
    };
    if (producto && reglasDescuento.length > 0) {
      obtenerSubtotal();
    }
  }, [producto, quantity, reglasDescuento]);
  const [cropData, setCropData] = useState(
    Array(1).fill({ crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null })
  );
  const [loadingPantalla, setLoadingPantalla] = useState(false);

  const effectiveQuantity = sameImage ? 1 : quantity;

  const handleQuantityChange = (e) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(val);
    const targetLength = sameImage ? 1 : val;

    setImages((prev) => {
      const newArray = [...prev];
      while (newArray.length < targetLength) newArray.push(null);
      return newArray.slice(0, targetLength);
    });

    setCroppedImages((prev) => {
      const newArray = [...prev];
      while (newArray.length < targetLength) newArray.push(null);
      return newArray.slice(0, targetLength);
    });

    setCropData((prev) => {
      const newArray = [...prev];
      while (newArray.length < targetLength) {
        newArray.push({ crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null });
      }
      return newArray.slice(0, targetLength);
    });
  };
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    // Tamaño máximo permitido: 10MB = 10 * 1024 * 1024 bytes
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Imagen demasiado grande',
        text: 'El tamaño máximo permitido es de 10MB.',
      });
      return;
    }

    const newImages = [...images];
    newImages[index] = URL.createObjectURL(file);
    setImages(newImages);
  };

  const calcularSubtotal = () => {
    const precio = producto?.precio ?? 0;
    const baseSubtotal = quantity * precio;
    let descuento = 0;

    // Aplicar reglas si están cargadas
    const reglasCantidad = reglasDescuento
      .filter(regla =>
        regla.is_active &&
        regla.condition_type === 'quantity' &&
        parseFloat(regla.min_value) <= quantity
      )
      .map(regla => ({
        min: parseFloat(regla.min_value),
        porcentaje: parseFloat(regla.discount_value) / 100
      }));

    if (reglasCantidad.length > 0) {
      descuento = Math.max(...reglasCantidad.map(r => r.porcentaje));
    }

    const totalConDescuento = baseSubtotal * (1 - descuento);

    return {
      base: baseSubtotal,
      descuento,
      total: totalConDescuento
    };
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const newArr = [...prev];
      newArr[index] = null;
      return newArr;
    });

    setCroppedImages((prev) => {
      const newArr = [...prev];
      newArr[index] = null;
      return newArr;
    });

    setCropData((prev) => {
      const newArr = [...prev];
      newArr[index] = { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null };
      return newArr;
    });
  };

  const handleCropChange = (crop, index) => {
    setCropData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], crop };
      return newData;
    });
  };

  const handleZoomChange = (zoom, index) => {
    setCropData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], zoom };
      return newData;
    });
  };

  const handleCropComplete = (croppedAreaPixels, index) => {
    setCropData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], croppedAreaPixels };
      return newData;
    });
  };

  const handleSaveCrop = async (index) => {
    try {
      const imageSrc = images[index];
      const croppedAreaPixels = cropData[index].croppedAreaPixels;
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);

      const newCroppedImages = [...croppedImages];
      newCroppedImages[index] = cropped;
      setCroppedImages(newCroppedImages);

    } catch (error) {
    }
  };

  const blobUrlToFile = async (blobUrl, fileName) => {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const handleAgregarCarrito = async () => {
    const missing = croppedImages.some(img => !img);
    if (missing) {
      mostrarError('Te faltan recortar alguna imagen')
      return;
    }

    const formData = new FormData();
    const archivos = [];

    if (sameImage) {
      const file = await blobUrlToFile(croppedImages[0], `iman_1.jpg`);
      formData.append('imagen_unica', file);
      formData.append('cantidad', quantity);
      archivos.push(file); // guardamos para el carrito
    } else {
      for (let i = 0; i < croppedImages.length; i++) {
        const file = await blobUrlToFile(croppedImages[i], `iman_${i + 1}.jpg`);
        formData.append('imagenes[]', file);
        archivos.push(file); // guardamos cada uno
      }
    }

    let carrito = {
      quantity: quantity,
      precioUnidad: producto.precio,
      images: archivos,
      id: producto.id
    };
    setLoadingPantalla(true);
    const exito = await handleAddCart(carrito);
    setLoadingPantalla(false);
    setMostrarResumen(true);

  };


  return (
    <div className="flex">
      {
        loadingPantalla && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col justify-center items-center z-50">
            <div className="w-12 h-12 border-4 border-[#34C6F3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 text-lg font-semibold">Subiendo imágenes...</p>
          </div>
        )
      }
      {/* CONTENIDO PRINCIPAL */}
      <button
        onClick={() => setMostrarResumen(true)}
        className="fixed bottom-20 right-9 transform -translate-y-1/2 bg-[#34C6F3] hover:bg-[#28b0dc] text-white p-4 rounded-full shadow-lg z-50"
        title="Ver carrito"
      >
        {/* Badge de cantidad */}
        {pedido.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md z-50">
            {pedido.length}
          </span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.3 5.4a1 1 0 001 .6h11.4a1 1 0 001-.6L20 13M9 21h.01M15 21h.01"
          />
        </svg>
      </button>


      <section className="flex-1 flex flex-col items-center py-10 px-4 text-center">

        <div className="mb-6 w-full max-w-screen-lg">
          {/* 🟢 Recuadro informativo */}
          {mostrarPopup && (
            <div className="relative bg-green-100/80 border border-green-300 text-green-900 text-sm rounded-xl p-5 mb-6 shadow-sm">
              <button
                onClick={() => setMostrarPopup(false)}
                className="absolute top-2 right-3 text-green-900 hover:text-green-700 text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>

              <h3 className="text-base font-semibold mb-2">ℹ️ Instrucciones importantes</h3>

              <p className="mb-2">
                <strong>📷 Tipo de pedido:</strong> Si seleccionás <strong>“Una sola imagen para todos los imanes”</strong>, podés subir una sola imagen y pedir, por ejemplo, <strong>10 imanes iguales</strong>. Luego podés repetir el proceso con otra imagen si querés pedir otros 10 iguales pero con otra foto.
              </p>

              <p className="mb-4">
                Si elegís <strong>“Diferentes imágenes por imán”</strong>, deberás subir una imagen distinta para cada unidad que vayas a encargar.
              </p>

              <div className="border-t border-green-300 pt-3 mt-3">
                <p className="mb-1">
                  <strong>🚫 Formato HEIC / HEIF no compatible:</strong> Las fotos en formato <strong>.HEIC</strong> o <strong>.HEIF</strong> (usado por iPhones) <span className="underline">no pueden ser subidas</span> directamente en la página.
                </p>
                <p className="mb-1">
                  👉 Si tenés fotos en ese formato, podés <strong>enviarlas por WhatsApp</strong> o convertirlas fácilmente a JPG usando esta web:
                </p>
                <p className="mb-3">
                  🔄 <a href="https://convertio.co/es/heif-jpg/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                    convertio.co/es/heif-jpg/
                  </a>
                </p>

                <p className="mb-1">
                  <strong>📏 Margen de fabricación:</strong> Al momento de fabricar los imanes, se dobla aproximadamente <strong>1 mm</strong> de cada borde.
                </p>
                <p>
                  👉 Evitá colocar textos o detalles importantes <strong>cerca de los bordes</strong> de la imagen, ya que pueden recortarse.
                </p>
              </div>
            </div>
          )}


          {/* Radios de tipo de pedido */}
          <label className="text-lg font-semibold block mb-2 text-gray-700">Tipo de pedido</label>
          <div className="flex flex-col sm:flex-row justify-center gap-6 items-start sm:items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={sameImage}
                onChange={() => {
                  setSameImage(true);
                  handleQuantityChange({ target: { value: quantity } });
                }}
                className="h-4 w-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full"
              />
              <span className="text-sm text-gray-700">Una sola imagen para todos los imanes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!sameImage}
                onChange={() => {
                  setSameImage(false);
                  handleQuantityChange({ target: { value: quantity } });
                }}
                className="h-4 w-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full"
              />
              <span className="text-sm text-gray-700">Diferentes imágenes por imán</span>
            </label>
          </div>
        </div>



        {/* Cantidad de imanes */}
        <div className="flex">
          <div>
            <label className="block text-2xl font-semibold mb-4 text-gray-700">
              Cantidad de imanes
            </label>
            <div className="flex items-center mb-8 gap-2">
              <button
                onClick={() => {
                  const newQty = Math.max(1, quantity - 1);
                  handleQuantityChange({ target: { value: newQty } });
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
              >
                −
              </button>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border border-gray-300 rounded py-1 shadow-sm"
              />

              <button
                onClick={() => {
                  const newQty = quantity + 1;
                  handleQuantityChange({ target: { value: newQty } });
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
              >
                +
              </button>

              <button
                onClick={handleAgregarCarrito}
                className="bg-[#34C6F3] text-white px-4 py-2 ml-4 rounded hover:bg-[#28b0dc] text-sm transition"
              >
                Añadir al carrito
              </button>
            </div>

          </div>
        </div>
        {producto && subtotal && (
          <div className="text-left">
            <p className="text-lg text-gray-800 font-semibold">
              Precio por imán: ${producto.precio}
            </p>

            <div className="mt-2 text-sm text-gray-700">
              <p>
                Subtotal: $
                {subtotal.base.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>

              {subtotal.descuento > 0 && (
                <p>Descuento aplicado: {subtotal.descuento * 100}%</p>
              )}

              <p className="font-bold text-lg">
                Total: $
                {subtotal.total.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}


        {/* Cuadrantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-lg">
          {Array.from({ length: effectiveQuantity }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg shadow p-4 flex flex-col items-center"
            >
              {images[index] ? (
                <>
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded">
                    <Cropper
                      image={images[index]}
                      crop={cropData[index].crop}
                      zoom={cropData[index].zoom}
                      aspect={1}
                      onCropChange={(crop) => handleCropChange(crop, index)}
                      onZoomChange={(zoom) => handleZoomChange(zoom, index)}
                      onCropComplete={(_, croppedAreaPixels) =>
                        handleCropComplete(croppedAreaPixels, index)
                      }
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      title="Eliminar imagen"
                      className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 transition"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  <label className="w-full text-sm text-gray-600 mb-1">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={cropData[index].zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value), index)}
                    className="w-full mb-2"
                  />

                  <button
                    onClick={() => handleSaveCrop(index)}
                    className="bg-[#34C6F3] text-white px-4 py-1 rounded hover:bg-[#28b0dc] text-sm transition"
                  >
                    Guardar corte
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-sm text-gray-600 hover:text-[#34C6F3] transition">
                  <span className="mb-1 font-medium">Subí tu imagen</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp, image/gif"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, index)}
                  />
                  <div className="bg-[#34C6F3] text-white px-3 py-1 rounded mt-1 text-xs shadow">
                    Seleccionar archivo
                  </div>
                </label>
              )}

              {croppedImages[index] && (
                <img
                  src={croppedImages[index]}
                  alt={`Preview ${index}`}
                  className="mt-4 w-full h-auto border rounded"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-gray-100 shadow-lg p-6 transform transition-transform duration-300 z-50
    ${mostrarResumen ? 'translate-x-0' : 'translate-x-full'}
  `}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => setMostrarResumen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition"
          title="Cerrar resumen"
        >
          ✕
        </button>

        <Resumen />
      </aside>

      <ToastContainer />
    </div>

  );
};

export default Product;
