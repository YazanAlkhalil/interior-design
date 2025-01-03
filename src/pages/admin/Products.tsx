import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { ImageIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { toast } from "react-hot-toast";

interface Section {
  uuid: string;
  title: string;
}

interface Category {
  uuid: string;
  title: string;
  image: string;
  description: string;
  section: string;
}

interface Color {
  hex_code: string;
}

interface ProductColor {
  color: Color;
  price: number;
  quantity: number;
  image: string | File | undefined;
}

interface Product {
  uuid?: string;
  name: string;
  description: string;
  image: string;
  category: string;
  product_colors: ProductColor[];
}

interface PaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: BasicProduct[];
}

interface BasicProduct {
  uuid: string;
  name: string;
  image: string | null;
  category: string;
  average_rating: number;
}

export default function Products() {
  const [products, setProducts] = useState<BasicProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const pageSize = 10;
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    image: "",
    category: "",
    product_colors: [],
  });

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { authFetch } = useAuthenticatedFetch();

  // New state for color variant form
  const [currentColorVariant, setCurrentColorVariant] = useState({
    hex_code: "#000000",
    price: "",
    quantity: "",
    image: null as File | null,
  });

  // Add new state for loading
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);

  // Add new state for delete confirmation
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      category: "",
      product_colors: [],
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation for required fields including color variants
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Add validation for at least one color variant
    if (formData.product_colors.length === 0) {
      toast.error("Please add at least one color variant");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      formData.product_colors.forEach((colorVariant, index) => {
        formDataToSend.append(`hex_codes[${index}]`, colorVariant.color.hex_code);
        formDataToSend.append(`prices[${index}]`, colorVariant.price.toString());
        formDataToSend.append(`quantities[${index}]`, colorVariant.quantity.toString());
        if (colorVariant.image) {
          formDataToSend.append(`images[${index}]`, colorVariant.image);
        }
      });


      const url = editingProduct 
        ? `products/${editingProduct.uuid}/`
        : 'products/';

      const response = await authFetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to save product');

      
      fetchProducts();

      setIsDialogOpen(false);
      setSelectedSection("");
      setSelectedImage(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Failed to save product");
    }
  };

  

  const handleDelete = async (productUuid: string) => {
    setDeletingProduct(productUuid);
  };

  // Add new confirmation handler
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const response = await authFetch(`products/${deletingProduct}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      fetchProducts()
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddColorVariant = () => {
    if (!currentColorVariant.hex_code || !currentColorVariant.price || !currentColorVariant.quantity) {
      toast.error("Please fill in all variant fields (color, price, and quantity)");
      return;
    }

    setFormData(prev => ({
      ...prev,
      product_colors: [
        ...prev.product_colors,
        {
          color: { hex_code: currentColorVariant.hex_code },
          price: Number(currentColorVariant.price) || 0,
          quantity: Number(currentColorVariant.quantity) || 0,
          image: currentColorVariant.image || "",
        },
      ],
    }));

    // Reset color variant form
    setCurrentColorVariant({
      hex_code: "#000000",
      price: "",
      quantity: "",
      image: null,
    });
  };

  // Update products fetch to handle pagination
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`products/?page=${currentPage}&page_size=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: PaginatedProducts = await response.json();
      
      setProducts(data.results);
      setTotalProducts(data.count);
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {

    fetchProducts();
  }, [currentPage]);

  // Fetch sections on component mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await authFetch('sections/?page=1&page_size=100');
        if (!response.ok) throw new Error('Failed to fetch sections');
        const data = await response.json();
        setSections(data.results || data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, []);

  // Fetch categories when a section is selected
  const handleSectionChange = async (value: string) => {
    setSelectedSection(value);
    setFormData(prev => ({ ...prev, category: "" }));
    
    // Find the section title from the selected UUID
    const selectedSectionTitle = sections.find(s => s.uuid === value)?.title;
    if (!selectedSectionTitle) return;

    // Fetch categories using section title
    const res = await authFetch(`category/?section_title=${selectedSectionTitle}`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []); 
    }
  };

  const handleEditProduct = async (uuid: string) => {
    setEditLoadingId(uuid); // Set loading state for this specific product
    try {
      const response = await authFetch(`products/${uuid}/`);
      if (!response.ok) throw new Error('Failed to fetch product details');
      let fullProduct = await response.json();
      fullProduct = fullProduct.data;
      
      setSelectedSection(fullProduct.category.section);

      //get categories for this section
      const selectedSectionTitle = sections.find(s => s.uuid === fullProduct.category.section)?.title;
      if (!selectedSectionTitle) return;
      const res = await authFetch(`category/?section_title=${selectedSectionTitle}`);
      
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []); 
      }
      // Set form data with the fetched product details
      setFormData({
        uuid: fullProduct.uuid,
        name: fullProduct.name,
        description: fullProduct.description,
        category: fullProduct.category.uuid,
        image: fullProduct.image ?? null,
        product_colors: fullProduct.product_colors.map((pc: any) => ({
          color: { hex_code: pc.color.hex_code },
          price: pc.price,
          quantity: pc.quantity,
          image: pc.image 
        }))
      });

      setEditingProduct(fullProduct);
      setIsDialogOpen(true); // Open the main dialog instead of the separate edit dialog
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setEditLoadingId(null); // Clear loading state
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingProduct(null);
            setSelectedImage(null);
            setImagePreview("");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="top-0 bg-background -z-20 pb-4">
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Main Product Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Section Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Select
                  value={selectedSection}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.uuid} value={section.uuid}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={!selectedSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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

              {/* Color Variant Form */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Color Variant</label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      type="color"
                      value={currentColorVariant.hex_code}
                      onChange={(e) => setCurrentColorVariant(prev => ({
                        ...prev,
                        hex_code: e.target.value
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-2">Price ($)</label>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={currentColorVariant.price}
                      onChange={(e) => setCurrentColorVariant(prev => ({
                        ...prev,
                        price: e.target.value
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-2">Quantity</label>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={currentColorVariant.quantity}
                      onChange={(e) => setCurrentColorVariant(prev => ({
                        ...prev,
                        quantity: e.target.value
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-2">Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCurrentColorVariant(prev => ({
                            ...prev,
                            image: e.target.files![0]
                          }));
                        }
                      }}
                    />
                  </div>
                  <Button className="text-white" type="button" onClick={handleAddColorVariant}>
                    Add Variant
                  </Button>
                </div>
              </div>

              {/* Display Color Variants */}
              <div className="space-y-2">
                {formData.product_colors.map((variant, index) => (
                  <div key={index} className="flex items-center bg-slate-100 gap-4 p-2 border rounded">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: variant.color.hex_code }}
                    />
                    <span>${variant.price}</span>
                    <span>Qty: {variant.quantity}</span>
                    {variant.image && (
                      <img src={variant.image instanceof File ? URL.createObjectURL(variant.image as File) : variant.image} alt="Color variant" className="w-12 h-12 object-cover" />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          product_colors: prev.product_colors.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="text-white">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.uuid}>
                <TableCell>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {typeof product.average_rating === 'number' 
                    ? product.average_rating.toFixed(1) 
                    : '0.0'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product.uuid)}
                      disabled={editLoadingId === product.uuid}
                    >
                      {editLoadingId === product.uuid ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.uuid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={!prevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink isActive={true}>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={!nextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Add the delete confirmation dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteProduct}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
