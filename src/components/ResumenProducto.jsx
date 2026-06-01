
import useCont from "../hooks/useCont";
import { Trash2 } from 'lucide-react'; // También existe `Trash`, pero `Trash2` es más estilizado

const ResumenProducto = (props) => {
    const { handleEliminarPedido } = useCont();
    const { producto, index } = props;
    return (
        <div className="gap-2 items-center ">
            <div className=" gap-2 cart-product items-center">
                <div className="contenedor-imagenes flex gap-0.5 flex-wrap">
                    {producto.imagenes?.map((image, imgIndex) => (
                        <img
                            key={imgIndex}
                            src={`${import.meta.env.VITE_API_URL}public/storage/uploads/${image}`}
                            alt={`Imagen carrito ${index + 1} - ${imgIndex + 1}`}
                            className="w-10 h-10 object-cover rounded"
                        />
                    ))}


                </div>
                {/* Imagenes del producto */}
                <div className="flex-1">
                    <p className="text-sm">Total de imanes: {producto.cantidad}</p>
                    <p className="text-sm">Precio unidad: {producto.precio_unidad}</p>
                    <p className="text-sm">Sub total: {producto.precio_total}</p>
                </div>
                <button onClick={() => handleEliminarPedido(producto.id)} className="text-red-600 cursor-pointer hover:text-red-800">
                    <Trash2 size={20} className="inline-block mr-1" />

                </button>

            </div>
        </div>
    );
}

export default ResumenProducto;
