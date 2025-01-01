import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card"
import { Star } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom";
import './BlackBoxProduct.css'
interface ProductProps {
  id: string;
  name: string
  price: number
  image: string
  rating: number
}

export const Product = ({ id, name, price, image, rating }: ProductProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="w-[300px] hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/home/products/${id}`)}
    >
      <CardHeader className="p-0">
      <div className="product-image border-2 border-[#ffbb00]">
        <img src={image} alt={name} />
        <div className="product-price">${price}</div>
      </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4">
        <span className="text-lg font-bold">${price}</span>
        <Button variant="outline">Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}