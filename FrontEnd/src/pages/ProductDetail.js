// ProductDetail.js - Vista detallada de productos del marketplace
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ArrowLeft, 
  Package, 
  Shield, 
  Truck, 
  ChevronRight,
  MessageSquare,
  Send,
  CheckCircle,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

const ProductDetail = ({ productId, onBack, onAddToCart }) => {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    console.log('🔍 ProductDetail montado con productId:', productId);
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching product:', productId);

      // Fetch producto
      const productRes = await fetch(`http://localhost:5000/api/products/${productId}`);
      console.log('📡 Product response status:', productRes.status);

      if (!productRes.ok) {
        console.error('❌ Error fetching product:', productRes.status, productRes.statusText);
        setProduct(null);
        setLoading(false);
        return;
      }

      const productData = await productRes.json();
      console.log('✅ Product data received:', productData);
      setProduct(productData);

      // Fetch productos similares
      const similarRes = await fetch(`http://localhost:5000/api/products?category=${productData.category}&limit=4`);
      const similarData = await similarRes.json();
      setSimilarProducts(similarData.filter(p => p.id !== productId).slice(0, 3));

      // Fetch reviews reales
      try {
        const reviewsRes = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);

        if (!reviewsRes.ok) {
          console.warn('Reviews endpoint not available or returned error');
          setReviews([]);
          return;
        }

        const reviewsData = await reviewsRes.json();

        // Validar que reviewsData tiene la estructura esperada
        if (!reviewsData || !Array.isArray(reviewsData.reviews)) {
          console.warn('Invalid reviews data structure:', reviewsData);
          setReviews([]);
          return;
        }

        // Transformar reviews para el formato del componente
        const formattedReviews = reviewsData.reviews.map(review => ({
          id: review.id,
          user: review.user?.nickname || review.user?.name || 'Usuario',
          rating: review.rating,
          comment: review.comment || '',
          date: new Date(review.createdAt).toISOString().split('T')[0],
          verified: review.isVerified || false
        }));

        setReviews(formattedReviews);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        // Si falla, usar reviews vacías (el producto se mostrará sin reseñas)
        setReviews([]);
      }

    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!onAddToCart) {
      console.error('⚠️ onAddToCart no está definido');
      return;
    }

    if (!product) {
      console.error('⚠️ Producto no disponible');
      return;
    }

    setAddingToCart(true);
    try {
      console.log(`🛒 Agregando ${quantity} ${product.name}(s) al carrito`);

      // Agregar el producto al carrito según la cantidad seleccionada
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }

      // Mostrar notificación de éxito
      alert(`✅ ${quantity} ${product.name}(s) agregado${quantity > 1 ? 's' : ''} al carrito`);

      // Resetear cantidad a 1
      setQuantity(1);
    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      alert('Error al agregar el producto al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para dejar una reseña');
        return;
      }

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar reseña');
      }

      const createdReview = await response.json();

      // Agregar la nueva reseña al inicio de la lista
      const formattedReview = {
        id: createdReview.id,
        user: createdReview.user.nickname || createdReview.user.name || 'Usuario',
        rating: createdReview.rating,
        comment: createdReview.comment,
        date: new Date(createdReview.createdAt).toISOString().split('T')[0],
        verified: createdReview.isVerified
      };

      setReviews([formattedReview, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      alert('¡Gracias por tu reseña!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Error al enviar la reseña');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl">Producto no encontrado</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-[#FFD700] text-black rounded-lg font-medium hover:bg-[#FFC700]"
          >
            Volver al Marketplace
          </button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header con botón de regreso */}
      <div className="bg-[#0F1629] border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Marketplace</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            {/* Imagen Principal */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-8 aspect-square flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Package className="w-32 h-32 mx-auto mb-4 text-[#FFD700]" />
                <p className="text-gray-400">Imagen del producto</p>
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-[#1E293B] rounded-lg p-4 aspect-square flex items-center justify-center transition-all ${
                    selectedImage === index ? 'ring-2 ring-[#FFD700]' : 'hover:bg-[#2D3B54]'
                  }`}
                >
                  <Package className="w-8 h-8 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            {/* Categoría y Stock */}
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] rounded-full text-sm font-medium">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {product.stock} en stock
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
                  Agotado
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? 'fill-[#FFD700] text-[#FFD700]'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">
                {averageRating} ({reviews.length} reseñas)
              </span>
            </div>

            {/* Precio */}
            <div className="bg-[#1E293B] rounded-xl p-6 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[#FFD700]">
                  {product.priceFELI.toLocaleString()}
                </span>
                <span className="text-2xl text-[#FFD700]">FELICOINS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  ≈ ${product.priceUSD.toFixed(2)} USD
                </span>
                <div className="flex items-center gap-2 text-green-400">
                  <Gift className="w-5 h-5" />
                  <span className="font-medium">+{product.cashback} FELICOINS de cashback</span>
                </div>
              </div>
            </div>

            {/* Cantidad y Agregar al Carrito */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-400 font-medium">Cantidad:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#2D3B54] transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#2D3B54] transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 bg-[#FFD700] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FFC700] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      Agregar al Carrito
                    </>
                  )}
                </button>
                <button className="w-14 h-14 bg-[#1E293B] rounded-xl flex items-center justify-center hover:bg-[#2D3B54] transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#1E293B] rounded-lg p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#FFD700]" />
                <div>
                  <p className="font-medium text-sm">Garantía</p>
                  <p className="text-xs text-gray-400">1 año</p>
                </div>
              </div>
              <div className="bg-[#1E293B] rounded-lg p-4 flex items-center gap-3">
                <Truck className="w-8 h-8 text-[#FFD700]" />
                <div>
                  <p className="font-medium text-sm">Envío</p>
                  <p className="text-xs text-gray-400">Gratis</p>
                </div>
              </div>
              <div className="bg-[#1E293B] rounded-lg p-4 flex items-center gap-3">
                <Gift className="w-8 h-8 text-[#FFD700]" />
                <div>
                  <p className="font-medium text-sm">Cashback</p>
                  <p className="text-xs text-gray-400">{product.cashback} FELICOINS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Información */}
        <div className="bg-[#0F1629] rounded-2xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-800">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#1E293B] text-[#FFD700] border-b-2 border-[#FFD700]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'description' && 'Descripción'}
                {tab === 'specifications' && 'Características'}
                {tab === 'reviews' && `Reseñas (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 space-y-3">
                  <h3 className="text-xl font-bold text-white">Características destacadas:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                      <span>Producto verificado en blockchain para autenticidad garantizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                      <span>Cashback automático en Felicoins al confirmar la compra</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                      <span>Garantía respaldada por smart contract</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                      <span>Envío rastreado en tiempo real</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'SKU', value: product.id },
                  { label: 'Categoría', value: product.category },
                  { label: 'Stock Disponible', value: product.stock },
                  { label: 'Precio FELICOINS', value: product.priceFELI },
                  { label: 'Precio USD', value: `$${product.priceUSD}` },
                  { label: 'Cashback', value: `${product.cashback} FELICOINS` },
                  { label: 'Estado', value: product.isActive ? 'Activo' : 'Inactivo' },
                  { label: 'Blockchain', value: 'Ethereum Sepolia' }
                ].map((spec, index) => (
                  <div key={index} className="bg-[#1E293B] rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">{spec.label}</p>
                    <p className="font-medium text-lg">{spec.value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Resumen de calificaciones */}
                <div className="bg-[#1E293B] rounded-xl p-6 flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#FFD700] mb-2">{averageRating}</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? 'fill-[#FFD700] text-[#FFD700]'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm">{reviews.length} reseñas</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => r.rating === stars).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-gray-400 w-12">{stars} ★</span>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FFD700]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulario de nueva reseña */}
                {user && (
                  <form onSubmit={handleSubmitReview} className="bg-[#1E293B] rounded-xl p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-[#FFD700]" />
                      Deja tu reseña
                    </h3>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Calificación</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= newReview.rating
                                  ? 'fill-[#FFD700] text-[#FFD700]'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Tu comentario</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Comparte tu experiencia con este producto..."
                        className="w-full bg-[#0F1629] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] min-h-[100px]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#FFD700] text-black py-3 rounded-lg font-bold hover:bg-[#FFC700] transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Publicar Reseña
                    </button>
                  </form>
                )}

                {/* Lista de reseñas */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="bg-[#1E293B] rounded-xl p-12 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg mb-2">Aún no hay reseñas para este producto</p>
                      <p className="text-gray-500 text-sm">
                        {user ? '¡Sé el primero en dejar tu opinión!' : 'Inicia sesión para dejar la primera reseña'}
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-[#1E293B] rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold">{review.user}</p>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                                  Verificado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-[#FFD700] text-[#FFD700]'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos Similares */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Productos Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#0F1629] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
                  onClick={() => {
                    setProduct(null);
                    fetchProductDetails();
                  }}
                >
                  <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 aspect-square flex items-center justify-center">
                    <Package className="w-20 h-20 text-[#FFD700]" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[#FFD700] font-bold">
                        {product.priceFELI} FELICOINS
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                        <span className="text-sm text-gray-400">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

