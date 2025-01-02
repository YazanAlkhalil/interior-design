import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Product } from "../components/shared/Product";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TopProducts } from "../components/shared/TopProduct";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { Skeleton } from "../components/ui/skeleton";

const SectionProducts = () => {
  const { sectionId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Array<{uuid: string, title: string, section:string}>>([]);
  const [products, setProducts] = useState<Array<any>>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const { authFetch } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  
  const filteredProducts = products;
  const formatSectionTitle = (title: string) => {
    return decodeURIComponent(title || '');
  };



  const getProducts = async () => {
    const categoryQuery = selectedCategory === "all" 
      ? "" 
      : `category=${selectedCategory}`;
    const res = await authFetch(`products/?section=${sectionId}&${categoryQuery}`);
    const data = await res.json();
    setProducts(data.results || []);
  }

  
  const getCategories = async () => {
    const sectionRes = await authFetch(`sections/${sectionId}`);
    const sectionData = await sectionRes.json();
    setSectionTitle(sectionData.title);
    

    const res = await authFetch(`category/?section_title=${encodeURIComponent(sectionData.title)}`);
    let apiCategories = await res.json();
    apiCategories = apiCategories.categories;
    setCategories([
      { uuid: 'all', title: 'All' },
      ...apiCategories
    ]);
  }
  
  const getData = async () => {
    setIsLoading(true);
    try {
      await getCategories();
      await getProducts();
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    getData()
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          {isLoading ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <h1 className="text-3xl font-bold">
              {formatSectionTitle(sectionTitle ?? '')} Products
            </h1>
          )}
          
          {isLoading ? (
            <Skeleton className="h-10 w-[180px]" />
          ) : (
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.uuid} value={category.uuid}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            // Loading skeleton grid
            [...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-none" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-none" />
                    <Skeleton className="h-4 w-1/2 rounded-none" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24 rounded-none" />
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            filteredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Product {...product} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SectionProducts;
