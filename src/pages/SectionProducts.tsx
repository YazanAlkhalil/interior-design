import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Product } from "../components/shared/Product";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TopProducts } from "../components/shared/TopProduct";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useInView } from 'react-intersection-observer';

const SectionProducts = () => {
  const { sectionId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Array<{uuid: string, title: string, section:string}>>([]);
  const [products, setProducts] = useState<Array<any>>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const { authFetch } = useAuthenticatedFetch();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  
  const filteredProducts = products;
  const formatSectionTitle = (title: string) => {
    return decodeURIComponent(title || '');
  };



  const getProducts = async (pageNumber: number) => {
    const categoryQuery = selectedCategory === "all" 
      ? "" 
      : `category=${selectedCategory}`;
    const res = await authFetch(`products/?${categoryQuery}&page=${pageNumber}`);
    const data = await res.json();
    
    if (pageNumber === 1) {
      setProducts(data.results || []);
    } else {
      setProducts(prev => [...prev, ...(data.results || [])]);
    }
    
    setHasMore(!!data.next);
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
    setPage(1);
    await getCategories();
    getProducts(1);
  }

  useEffect(() => {
    if (inView && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      getProducts(nextPage);
    }
  }, [inView]);

  useEffect(() => {
    getData();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {formatSectionTitle(sectionTitle ?? '')} Products
          </h1>
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
        
        {hasMore && (
          <div ref={ref} className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionProducts;
