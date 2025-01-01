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
import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

interface ColorVariant {
  color: string;
  price: number;
  quantity: number;
  colorCode: string;
}

// Mock data - replace with your actual data
const productData = {
  id: "1",
  name: "Modern Lounge Chair",
  description: "A comfortable and stylish lounge chair perfect for any modern living space. Features premium materials and exceptional craftsmanship.",
  rating: 4.5,
  reviews: 128,
  images: [
    require("../assets/images/images (2).jpeg"),
    require("../assets/images/images (2).jpeg"),
    // Add more images...
  ],
  colorVariants: [
    { color: "Classic Brown", price: 299.99, quantity: 10, colorCode: "#8B4513" },
    { color: "Charcoal Grey", price: 319.99, quantity: 5, colorCode: "#36454F" },
    { color: "Cream White", price: 309.99, quantity: 8, colorCode: "#FFFDD0" },
  ] as ColorVariant[],
};

const ProductDetails = () => {
  const { productId } = useParams();
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(productData.colorVariants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (action === 'increase' && quantity < selectedColor.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: productData.id,
      name: productData.name,
      price: selectedColor.price,
      image: productData.images[0],
      quantity: quantity,
      color: selectedColor.color,
    });
  };

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
              {productData.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <img
                          src={image}
                          alt={`${productData.name} ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
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
          <h1 className="text-3xl font-bold">{productData.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(productData.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({productData.reviews} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{productData.description}</p>

          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Color</h3>
            <div className="flex gap-4">
              {productData.colorVariants.map((variant) => (
                <div
                  key={variant.color}
                  onClick={() => setSelectedColor(variant)}
                  className={`cursor-pointer space-y-2 ${
                    selectedColor.color === variant.color
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: variant.colorCode }}
                  />
                  <div className="text-sm">{variant.color}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price and Quantity */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              ${selectedColor.price.toFixed(2)}
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