import { useParams } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/Carousel";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

interface Color {
  uuid: string;
  hex_code: string;
}

interface ColorVariant {
  uuid: string;
  color: Color;
  price: string;
  quantity: number;
  image: string | null;
}

interface Product {
  uuid: string;
  name: string;
  description: string;
  image: string | null;
  product_colors: ColorVariant[];
  average_rating: number;
}

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { authFetch } = useAuthenticatedFetch();

  const getData = async () => {
    try {
      const res = await authFetch('products/' + productId);
      const data = await res.json();
      if (data.status === "success") {
        setProduct(data.data);
        setSelectedColor(data.data.product_colors[0]); // Set initial color
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [productId]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (selectedColor && selectedColor.quantity && action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (selectedColor && action === 'increase' && quantity < selectedColor.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedColor) return;
    
    addToCart({
      id: product.uuid,
      name: product.name,
      price: parseFloat(selectedColor.price),
      image: selectedColor.image || product.image || '',
      quantity: quantity,
      color: selectedColor.color.hex_code,
    });
  };

  if (!product || !selectedColor) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Carousel className="w-full max-w-xl">
            <CarouselContent>
              {/* Show main product image first */}
              {product.image && (
                <CarouselItem>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )}
              {/* Show selected color image if available */}
              {selectedColor.image && (
                <CarouselItem>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <img
                          src={selectedColor.image}
                          alt={`${product.name} - ${selectedColor.color.hex_code}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(product.average_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{product.description}</p>

          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Color</h3>
            <div className="flex gap-4">
              {product.product_colors.map((variant) => (
                <div
                  key={variant.uuid}
                  onClick={() => setSelectedColor(variant)}
                  className={`cursor-pointer space-y-2 ${
                    selectedColor.uuid === variant.uuid
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: variant.color.hex_code }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Price and Quantity */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              ${parseFloat(selectedColor.price).toFixed(2)}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">
                {selectedColor.quantity} available
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button className="w-full text-white" size="lg" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails; 