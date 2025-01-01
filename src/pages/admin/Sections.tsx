import { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Label } from "../../components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination"

interface Category {
  uuid: string;
  name: string;
  image: string;
  description: string;
  section: string;
}

interface Section {
  id: string;
  uuid: string;
  title: string;
  description: string;
  image: string;
  categories: Category[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Section[];
}

export default function Sections() {
  const [sections, setSections] = useState<Section[]>([
   
  ]);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    image: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ sectionId: string, category: Category } | null>(null);
  const [isEditingCategoryOpen, setIsEditingCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { authFetch } = useAuthenticatedFetch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; 
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [addingCategoryToSection, setAddingCategoryToSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<{[key: string]: boolean}>({});
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState<string | null>(null);
  const [editCategoryImagePreview, setEditCategoryImagePreview] = useState<string | null>(null);
  const [deletingSection, setDeletingSection] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{uuid: string, sectionId: string} | null>(null);

  const handleAddSection = async () => {
    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('title', newSection.title);
      formData.append('description', newSection.description);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      console.log(selectedImage);

      // Send POST request
      const response = await authFetch('sections/', {
        method: 'POST',
        body: formData,
        // Remove any Content-Type header if it's being set in authFetch
        headers: {}, // This will keep only the authentication headers if any
      });

      if (!response.ok) {
        const errorText = await response.text(); // Use text() instead of json() for error messages
        throw new Error(`Failed to create section: ${errorText}`);
      }

      const createdSection = await response.json();
      setSections([...sections, {
        id: createdSection.id,
        uuid: createdSection.uuid,
        title: createdSection.title,
        description: createdSection.description,
        image: createdSection.image,
        categories: []
      }]);

      // Reset form
      setNewSection({ title: '', description: '', image: '' });
      setSelectedImage(null);
      setIsAddingSectionOpen(false);
    } catch (error) {
      console.error('Error creating section:', error);
      // You might want to show an error message to the user here
    }
  };

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      // Create a temporary URL for preview
      const url = URL.createObjectURL(e.target.files[0]);
      setNewSection({ ...newSection, image: url });
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setNewSection({
      title: section.title,
      description: section.description,
      image: section.image,
    });
    setIsEditingSectionOpen(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    
    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('title', newSection.title);
      formData.append('description', newSection.description);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Send PUT request
      const response = await authFetch(`sections/${editingSection.uuid}/`, {
        method: 'PUT',
        body: formData,
        headers: {}, // This will keep only the authentication headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update section: ${errorText}`);
      }

      const updatedSection = await response.json();
      
      setSections(sections.map(section => 
        section.id === editingSection.id 
          ? {
              ...section,
              title: updatedSection.title,
              description: updatedSection.description,
              image: updatedSection.image
            }
          : section
      ));
      
      // Reset form
      setNewSection({ title: '', description: '', image: '' });
      setSelectedImage(null);
      setEditingSection(null);
      setIsEditingSectionOpen(false);
      
    } catch (error) {
      console.error('Error updating section:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleEditCategory = (sectionId: string, category: Category) => {
    setEditingCategory({ sectionId, category });
    setNewCategoryName(category.name);
    setIsEditingCategoryOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const formData = new FormData();
      formData.append('title', newCategoryName);
      formData.append('section', editingCategory.sectionId);
      if (editCategoryImage) {
        formData.append('image', editCategoryImage);
      }

      const response = await authFetch(`category/${editingCategory.category.uuid}/`, {
        method: 'PUT',
        body: formData,
        headers: {}, // Remove Content-Type to allow FormData to set it
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = await response.json();
      
      setSections(sections.map(section => 
        section.id === editingCategory.sectionId
          ? {
              ...section,
              categories: section.categories.map(cat =>
                cat.uuid === editingCategory.category.uuid
                  ? {
                      uuid: updatedCategory.uuid,
                      name: updatedCategory.title,
                      image: updatedCategory.image,
                      description: updatedCategory.description,
                      section: updatedCategory.section
                    }
                  : cat
              )
            }
          : section
      ));
      
      setNewCategoryName('');
      setEditCategoryImage(null);
      setEditCategoryImagePreview(null);
      setEditingCategory(null);
      setIsEditingCategoryOpen(false);
      
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getSections = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`sections/?page=${currentPage}&page_size=${pageSize}`);
      if(res.ok) {
        const data: PaginatedResponse = await res.json();
        
        // First set the sections without categories for immediate display
        const sectionsWithoutCategories = data.results.map(section => ({
          id: section.id,
          uuid: section.uuid,
          title: section.title,
          description: section.description,
          image: section.image,
          categories: []
        }));
        
        setSections(sectionsWithoutCategories);
        setIsLoading(false);
        
        // Then fetch categories for each section
        sectionsWithoutCategories.forEach(async (section) => {
          setIsCategoriesLoading(prev => ({ ...prev, [section.id]: true }));
          try {
            const categoryRes = await authFetch(`category/?section_title=${section.title}`);
            const categoriesData = await categoryRes.json();
            const categories = categoriesData.categories || [];
            
            setSections(currentSections => 
              currentSections.map(s => 
                s.id === section.id 
                  ? {
                      ...s,
                      categories: categories.map((cat: any) => ({
                        uuid: cat.uuid,
                        name: cat.title,
                        image: cat.image,
                        description: cat.description,
                        section: cat.section
                      }))
                    }
                  : s
              )
            );
          } finally {
            setIsCategoriesLoading(prev => ({ ...prev, [section.id]: false }));
          }
        });

        setTotalPages(Math.ceil(data.count / pageSize));
        setNextPage(data.next);
        setPrevPage(data.previous);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getSections();
  }, [currentPage]);

  const getPageFromUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const handlePrevPage = () => {
    if (prevPage) {
      const pageNum = getPageFromUrl(prevPage);
      if (pageNum) setCurrentPage(pageNum);
    }
  };

  const handleNextPage = () => {
    if (nextPage) {
      const pageNum = getPageFromUrl(nextPage);
      if (pageNum) setCurrentPage(pageNum);
    }
  };

  const handleCreateCategory = async () => {
    if (!addingCategoryToSection || !newCategoryTitle) return;

    try {
      const formData = new FormData();
      formData.append('title', newCategoryTitle);
      formData.append('section', addingCategoryToSection);
      if (newCategoryImage) {
        formData.append('image', newCategoryImage);
      }

      const response = await authFetch('category/', {
        method: 'POST',
        body: formData,
        headers: {}, // Remove Content-Type to allow FormData to set it
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      
      
      // Reset the form
      setNewCategoryTitle('');
      setNewCategoryImage(null);
      setNewCategoryImagePreview(null);
      setAddingCategoryToSection(null);
      setIsEditingCategoryOpen(false)

      getSections()
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      if (isEditing) {
        setEditCategoryImage(file);
        setEditCategoryImagePreview(previewUrl);
      } else {
        setNewCategoryImage(file);
        setNewCategoryImagePreview(previewUrl);
      }
    }
  };

  const handleDeleteSection = async (sectionUuid: string) => {
    setDeletingSection(sectionUuid);
  };

  const handleDeleteCategory = async (categoryUuid: string, sectionId: string) => {
    setDeletingCategory({ uuid: categoryUuid, sectionId });
  };

  const confirmDeleteSection = async () => {
    if (!deletingSection) return;

    try {
      const response = await authFetch(`sections/${deletingSection}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      setSections(sections.filter(section => section.uuid !== deletingSection));
      setDeletingSection(null);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      const response = await authFetch(`category/${deletingCategory.uuid}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setSections(sections.map(section => 
        section.id === deletingCategory.sectionId
          ? {
              ...section,
              categories: section.categories.filter(cat => cat.uuid !== deletingCategory.uuid)
            }
          : section
      ));
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sections Management</h1>
        <Dialog open={isAddingSectionOpen} onOpenChange={setIsAddingSectionOpen}>
          <DialogTrigger asChild>
            <Button className="text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Section Name"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
              />
              <Textarea
                placeholder="Description"
                value={newSection.description}
                onChange={(e) => setNewSection({...newSection, description: e.target.value})}
              />
              <div className="space-y-2">
                <Label htmlFor="image">Section Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {newSection.image && (
                  <div className="mt-2">
                    <img
                      src={newSection.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleAddSection} className="text-white">Save Section</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditingSectionOpen} onOpenChange={setIsEditingSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Section Name"
              value={newSection.title}
              onChange={(e) => setNewSection({...newSection, title: e.target.value})}
            />
            <Textarea
              placeholder="Description"
              value={newSection.description}
              onChange={(e) => setNewSection({...newSection, description: e.target.value})}
            />
            <div className="space-y-2">
              <Label htmlFor="edit-image">Section Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {newSection.image && (
                <div className="mt-2">
                  <img
                    src={newSection.image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleUpdateSection} className="text-white">Update Section</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingCategoryOpen} onOpenChange={setIsEditingCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="space-y-2">
              <Label htmlFor="edit-category-image">Category Image</Label>
              <Input
                id="edit-category-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleCategoryImageChange(e, true)}
                className="cursor-pointer"
              />
              {editCategoryImagePreview ? (
                <div className="mt-2">
                  <img
                    src={editCategoryImagePreview}
                    alt="New preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              ) : editingCategory?.category.image && (
                <div className="mt-2">
                  <img
                    src={editingCategory.category.image}
                    alt="Current category image"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleUpdateCategory} className="text-white">
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingSection} onOpenChange={() => setDeletingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this section? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingSection(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteSection}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteCategory}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="w-full overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50" 
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={false}
                    animate={{ rotate: expandedSections.includes(section.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                  <div className="flex items-center gap-4">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSection(section);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.uuid);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <CardContent className="border-t">
                    <motion.div 
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="pt-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Categories</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setAddingCategoryToSection(section.uuid)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Category
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input 
                                placeholder="Category Name" 
                                value={newCategoryTitle}
                                onChange={(e) => setNewCategoryTitle(e.target.value)}
                              />
                              <div className="space-y-2">
                                <Label htmlFor="category-image">Category Image</Label>
                                <Input
                                  id="category-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCategoryImageChange(e)}
                                  className="cursor-pointer"
                                />
                                {newCategoryImagePreview && (
                                  <div className="mt-2">
                                    <img
                                      src={newCategoryImagePreview}
                                      alt="Preview"
                                      className="w-full h-32 object-cover rounded-md"
                                    />
                                  </div>
                                )}
                              </div>
                              <Button 
                                className="text-white"
                                onClick={handleCreateCategory}
                              >
                                Save Category
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        {isCategoriesLoading[section.id] ? (
                          <Card className="p-4 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </Card>
                        ) : (
                          section.categories.map((category) => (
                            <Card key={category.uuid} className="p-4">
                              <div className="space-y-3">
                                {category.image && (
                                  <div className="w-full h-32 overflow-hidden rounded-md">
                                    <img
                                      src={category.image}
                                      alt={category.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{category.name}</span>
                                  <div className="space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleEditCategory(section.uuid, category)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      className="text-white"
                                      onClick={() => handleDeleteCategory(category.uuid, section.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={handlePrevPage}
                className={!prevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {/* First page */}
            <PaginationItem>
              <PaginationLink 
                onClick={() => setCurrentPage(1)}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>

            {/* Show ellipsis if there are many pages before current */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Current page if not first or last */}
            {currentPage > 1 && currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setCurrentPage(currentPage)}
                  isActive={true}
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Show ellipsis if there are many pages after current */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setCurrentPage(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                onClick={handleNextPage}
                className={!nextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
