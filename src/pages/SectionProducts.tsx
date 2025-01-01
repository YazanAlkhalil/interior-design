import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Product } from "../components/shared/Product";
import { motion } from "framer-motion";
import { useState } from "react";
import { TopProducts } from "../components/shared/TopProduct";

// Mock data - you can replace this with your actual data
const categories = ["All", "Modern", "Classic", "Contemporary", "Minimalist"];

const products = [
  {
    id: "1",
    name: "Modern Chair",
    price: 299.99,
    image: require("../assets/images/images (2).jpeg"),
    rating: 4,
    category: "Modern"
  },
  {
    id: "1",
    name: "Modern Chair",
    price: 299.99,
    image: require("../assets/images/images (2).jpeg"),
    rating: 4,
    category: "Modern"
  },
  // Add more products...
];

const SectionProducts = () => {
  const { sectionId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter(product => 
    selectedCategory === "All" || product.category === selectedCategory
  );

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{sectionId} Products</h1>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Product {...product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SectionProducts;
