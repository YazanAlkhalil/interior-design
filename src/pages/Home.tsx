import { Button } from "../components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious} from '../components/ui/Carousel'
import { Product } from "../components/shared/Product"
import { useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, Suspense, lazy } from "react";
import BlackBoxProduct from "../components/shared/BlackBoxProduct";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useLanguage } from "../context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { PanoramaViewer } from '../components/PanoramaViewer'
// import serviceImage from '../assets/images/2.jpg'
// Mock data for services

// Create a lazy-loaded version of the panorama component
const LazyPanorama = lazy(() => Promise.resolve({
  default: ({ imageUrl }: { imageUrl: string }) => (
    <Canvas camera={{ position: [0, 0, 0.1] }}>
      <PanoramaViewer imageUrl={imageUrl} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.5}
      />
    </Canvas>
  )
}));

export const Home = () => {
  const navigate = useNavigate()
  const productsRef = useRef(null)
  const isInView = useInView(productsRef, { once: true, amount: 0.2 })
  const {t} = useLanguage()


  const services = [
    {
      title: t('home.designService'),
      description: t('home.designServiceDescription'),
      image: require('../assets/images/design_service.jpg'),
      url: "services/interior-design"
    },
    {
      title: t('home.consultationService'),
      description: t('home.consultationServiceDescription'),
      image: require('../assets/images/consulting_service.png'),
      url: "services/consultation"
    },
    {
      title: t('home.implementationService'),
      description: t('home.implementationServiceDescription'),
      image: require('../assets/images/implement_service.jpg'),
      url: "services/implementation"
    },
    {
      title: t('home.areaService'),
      description: t('home.areaServiceDescription'),
      image: require('../assets/images/area_service.jpg'),
      url: "services/area"
    },
    {
      title: t('home.supervisionService'),
      description: t('home.supervisionServiceDescription'),
      image: require('../assets/images/supervision_service.jpg'),
      url: "services/supervision"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const productContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const productVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
      }
    }
  };

  interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    average_rating: number;
  }

  const [products, setProducts] = useState<Product[]>([])  
  const {authFetch} = useAuthenticatedFetch()
  const fetchProducts = async () => {
    const response = await authFetch('homepage/');
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    console.log(data)
    setProducts(data.results || data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  

  interface Design {
    uuid: string;
    title: string;
    description: string;
    category: string;
    primary_image: string;
  }

  interface DesignFile {
    uuid: string;
    file: string;
    file_type: string;
    is_primary: boolean;
    title: string;
  }

  interface DesignDetail {
    uuid: string;
    title: string;
    description: string;
    category: string;
    files: DesignFile[];
  }

  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<DesignDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const designsRef = useRef(null);
  const isDesignsInView = useInView(designsRef, { once: true, amount: 0.2 });

  const fetchDesigns = async () => {
    try {
      const response = await authFetch('designs/');
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const fetchDesignDetails = async (uuid: string) => {
    try {
      const response = await authFetch(`designs/${uuid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setSelectedDesign(data.data);
          setIsDetailOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching design details:', error);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const panoramas = [
    {
      title: t('home.bathroom360'),
      imageUrl: require('../assets/images/360/1_CShading_LightMix.jpg'),
      description: t('home.bathroom360Description')
    },
    {
      title: t('home.wardrobe360'),
      imageUrl: require('../assets/images/360/3600.jpg'),
      description: t('home.wardrobe360Description')
    },
    {
      title: t('home.bedroom360'),
      imageUrl: require('../assets/images/360/2_CShading_LightMix.jpg'),
      description: t('home.bedroom360Description')
    },
    {
      title: t('home.office360'),
      imageUrl: require('../assets/images/360/4.jpg'),
      description: t('home.office360Description')
    },
  ];

  // Create individual refs and inView states with correct options
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);

  const isInView1 = useInView(ref1, { once: true, amount: 0.1 });
  const isInView2 = useInView(ref2, { once: true, amount: 0.1 });
  const isInView3 = useInView(ref3, { once: true, amount: 0.1 });
  const isInView4 = useInView(ref4, { once: true, amount: 0.1 });

  const refs = [ref1, ref2, ref3, ref4];
  const inViewStates = [isInView1, isInView2, isInView3, isInView4];

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Services Carousel */}
      <motion.section 
        className="mb-16"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-6">{t('home.services')}</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto [direction:ltr]"
        >
          <CarouselContent>
            {services.map((service, index) => (
              <CarouselItem key={index} className="basis-full">
                <motion.div 
                  className="bg-white rounded-lg text-center shadow-md hover:cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => navigate(`/home/${service.url}`)}
                >
                  <div className="relative w-full [direction:ltr] overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-[1024px] h-[450px] rounded mx-auto mb-4 object-cover [transform-origin:center]"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 px-4 pb-4">{service.description}</p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </motion.section>

      {/* 360 Views Section */}
      <motion.section className="mb-16" variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6">{t('home.virtualTours')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panoramas.map((panorama, index) => (
            <motion.div 
              key={index}
              ref={refs[index]}
              className="h-[400px] rounded-lg overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0">
                {inViewStates[index] ? (
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-gray-500">Loading panorama...</div>
                    </div>
                  }>
                    <LazyPanorama imageUrl={panorama.imageUrl} />
                  </Suspense>
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="bg-black bg-opacity-50 text-white p-4 absolute bottom-0 left-0 right-0 z-10">
                <h3 className="font-semibold text-lg">{panorama.title}</h3>
                <p className="text-sm">{panorama.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Products Section */}
      <motion.section 
        ref={productsRef}
        variants={productContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('home.topProducts')}</h2>
          <Button 
            variant="outline"
            onClick={() => navigate('/home/sections')}
          >
            {t('home.seeMore')}
          </Button>
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={index}
              variants={productVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >

              <Product {...product} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Designs Section */}
      <motion.section 
        ref={designsRef}
        variants={productContainerVariants}
        initial="hidden"
        animate={isDesignsInView ? "visible" : "hidden"}
        className="mt-16"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('home.designs')}</h2>
          
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {designs.slice(0, 6).map((design, index) => (
            <motion.div
              key={design.uuid}
              variants={productVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchDesignDetails(design.uuid)}
              className="cursor-pointer"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative h-64">
                  <img 
                    src={design.primary_image} 
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{design.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{design.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Design Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDesign?.title}</DialogTitle>
          </DialogHeader>
          {selectedDesign && (
            <div className="space-y-4">
              <p className="text-gray-600">{selectedDesign.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedDesign.files.map((file) => (
                  <div key={file.uuid} className="space-y-2">
                    <img
                      src={file.file}
                      alt={file.title}
                      className="w-full h-64 object-cover rounded-md"
                    />
                    <p className="text-sm font-medium">{file.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}