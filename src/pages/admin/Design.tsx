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
  Loader2,
  Star,
  StarOff
} from 'lucide-react';
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';

interface Category {
  uuid: string;
  title: string;
  image: string;
}

interface DesignFile {
  uuid: string;
  file: string;
  file_type: string;
  is_primary: boolean;
  title: string;
}

interface Design {
  uuid: string;
  title: string;
  description: string;
  category: string;
  primary_image: string;
}

interface DesignDetail {
  uuid: string;
  title: string;
  description: string;
  category: string;
  files: DesignFile[];
}

interface DesignDetailResponse {
  status: string;
  data: DesignDetail;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Design[];
}

export default function Design() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingDesignOpen, setIsAddingDesignOpen] = useState(false);
  const { authFetch } = useAuthenticatedFetch();
  
  const [newDesign, setNewDesign] = useState({
    title: '',
    description: '',
    category: '',
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageTitles, setImageTitles] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [selectedDesign, setSelectedDesign] = useState<DesignDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignDetail | null>(null);
  const [existingFiles, setExistingFiles] = useState<DesignFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await authFetch('category/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('designs/');
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.results);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDesignDetails = async (uuid: string) => {
    try {
      const response = await authFetch(`designs/${uuid}`);
      if (response.ok) {
        const data: DesignDetailResponse = await response.json();
        if (data.status === "success") {
          setSelectedDesign(data.data);
          setIsDetailOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching design details:', error);
    }
  };

  const handleDeleteDesign = async (uuid: string) => {
    try {
      const response = await authFetch(`designs/${uuid}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDetailOpen(false);
        setSelectedDesign(null);
        fetchDesigns();
      }
    } catch (error) {
      console.error('Error deleting design:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDesigns();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setImageTitles(new Array(filesArray.length).fill(''));
    }
  };

  const handleAddDesign = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newDesign.title);
      formData.append('description', newDesign.description);
      formData.append('category', newDesign.category);
      
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
        formData.append('titles', imageTitles[index] || file.name);
        formData.append('is_primary', index === primaryImageIndex ? 'true' : 'false');
      });

      const response = await authFetch('designs/', {
        method: 'POST',
        body: formData,
        headers: {},
      });

      if (response.ok) {
        fetchDesigns();
        setIsAddingDesignOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating design:', error);
    }
  };

  const resetForm = () => {
    setNewDesign({
      title: '',
      description: '',
      category: '',
    });
    setSelectedFiles([]);
    setImageTitles([]);
    setPrimaryImageIndex(0);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageTitles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (primaryImageIndex === indexToRemove) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > indexToRemove) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleEditClick = async (design: DesignDetail) => {
    setIsEditMode(true);
    setEditingDesign(design);
    
    // Convert existing files to File objects
    const filePromises = design.files.map(async (file) => {
      const fileObj = await urlToFile(file.file, file.title);
      return {
        file: fileObj,
        title: file.title,
        is_primary: file.is_primary,
        uuid: file.uuid
      };
    });
    
    const convertedFiles = await Promise.all(filePromises);
    setExistingFiles(design.files);
    setNewDesign({
      title: design.title,
      description: design.description,
      category: design.category, // This should already be the UUID
    });
    setIsAddingDesignOpen(true);
  };

  const urlToFile = async (url: string, fileName: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const handleUpdateDesign = async () => {
    if (!editingDesign) return;

    try {
      const formData = new FormData();
      formData.append('title', newDesign.title);
      formData.append('description', newDesign.description);
      formData.append('category', newDesign.category);

      // Handle new files
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
        formData.append('titles', imageTitles[i] || selectedFiles[i].name);
        formData.append('is_primary', (i === primaryImageIndex).toString());
      }

      // Handle existing files that weren't deleted
      for (const file of existingFiles) {
        if (!filesToDelete.includes(file.uuid)) {
          const fileObj = await urlToFile(file.file, file.title);
          formData.append('files', fileObj);
          formData.append('titles', file.title);
          formData.append('is_primary', file.is_primary.toString());
        }
      }

      const response = await authFetch(`designs/${editingDesign.uuid}/`, {
        method: 'PUT',
        body: formData,
        headers: {},
      });

      if (response.ok) {
        fetchDesigns();
        resetForm();
        setIsAddingDesignOpen(false);
        setIsEditMode(false);
        setEditingDesign(null);
        setExistingFiles([]);
        setFilesToDelete([]);
      }
    } catch (error) {
      console.error('Error updating design:', error);
    }
  };

  const handleRemoveExistingFile = (uuid: string) => {
    setFilesToDelete(prev => [...prev, uuid]);
    setExistingFiles(prev => prev.filter(file => file.uuid !== uuid));
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
        <h1 className="text-2xl font-bold">Designs Management</h1>
        <Dialog open={isAddingDesignOpen} onOpenChange={setIsAddingDesignOpen}>
          <DialogTrigger asChild>
            <Button className="text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Design' : 'Add New Design'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pb-4">
              <Input
                placeholder="Design Title"
                value={newDesign.title}
                onChange={(e) => setNewDesign({...newDesign, title: e.target.value})}
              />
              <Textarea
                placeholder="Description"
                value={newDesign.description}
                onChange={(e) => setNewDesign({...newDesign, description: e.target.value})}
              />
              <Select
                value={newDesign.category}
                onValueChange={(value) => setNewDesign({...newDesign, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.uuid} value={category.uuid}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Design Images (Select multiple files)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFiles([]);
                        setImageTitles([]);
                        setPrimaryImageIndex(0);
                      }}
                      type="button"
                    >
                      Clear All
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Tip: Hold Ctrl (Windows) or Command (Mac) to select multiple files
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="space-y-2 border p-4 rounded-lg relative">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Input
                          placeholder="Image Title"
                          value={imageTitles[index]}
                          onChange={(e) => {
                            const newTitles = [...imageTitles];
                            newTitles[index] = e.target.value;
                            setImageTitles(newTitles);
                          }}
                        />
                        <Button
                          variant={primaryImageIndex === index ? "default" : "outline"}
                          onClick={() => setPrimaryImageIndex(index)}
                          className="w-full"
                        >
                          {primaryImageIndex === index ? (
                            <Star className="mr-2 h-4 w-4" />
                          ) : (
                            <StarOff className="mr-2 h-4 w-4" />
                          )}
                          {primaryImageIndex === index ? "Primary Image" : "Set as Primary"}
                        </Button>
                        <p className="text-sm text-gray-500">
                          File: {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-700 mb-2">Selected Images</h4>
                    <ul className="list-disc list-inside text-sm text-blue-600">
                      <li>Total images: {selectedFiles.length}</li>
                      <li>Primary image: {selectedFiles[primaryImageIndex]?.name || 'None'}</li>
                      {selectedFiles.length > 0 && !imageTitles.every(title => title.length > 0) && (
                        <li className="text-yellow-600">
                          Warning: Some images don't have titles
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {isEditMode && existingFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Existing Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {existingFiles.map((file) => (
                      <div key={file.uuid} className="space-y-2 border p-4 rounded-lg relative">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveExistingFile(file.uuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <img
                          src={file.file}
                          alt={file.title}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Input
                          value={file.title}
                          onChange={(e) => {
                            const updatedFiles = existingFiles.map(f =>
                              f.uuid === file.uuid ? { ...f, title: e.target.value } : f
                            );
                            setExistingFiles(updatedFiles);
                          }}
                        />
                        <Button
                          variant={file.is_primary ? "default" : "outline"}
                          onClick={() => {
                            const updatedFiles = existingFiles.map(f => ({
                              ...f,
                              is_primary: f.uuid === file.uuid
                            }));
                            setExistingFiles(updatedFiles);
                          }}
                          className="w-full"
                        >
                          {file.is_primary ? (
                            <Star className="mr-2 h-4 w-4" />
                          ) : (
                            <StarOff className="mr-2 h-4 w-4" />
                          )}
                          {file.is_primary ? "Primary Image" : "Set as Primary"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={isEditMode ? handleUpdateDesign : handleAddDesign} 
                className="text-white"
              >
                {isEditMode ? 'Update Design' : 'Save Design'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display designs here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designs.map((design) => (
          <Card 
            key={design.uuid} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => fetchDesignDetails(design.uuid)}
          >
            <CardHeader>
              <CardTitle>{design.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={design.primary_image}
                alt={design.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-gray-600">{design.description}</p>
              <p className="text-sm font-medium mt-2">Category: {design.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDesign?.title}</DialogTitle>
          </DialogHeader>
          {selectedDesign && (
            <div className="space-y-4">
              <p className="text-gray-600">{selectedDesign.description}</p>
              <p className="font-medium">Category: {selectedDesign.category}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedDesign.files.map((file) => (
                  <div key={file.uuid} className="space-y-2">
                    <img
                      src={file.file}
                      alt={file.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <p className="text-sm font-medium">{file.title}</p>
                    {file.is_primary && (
                      <span className="inline-flex items-center text-sm text-yellow-600">
                        <Star className="h-4 w-4 mr-1" />
                        Primary Image
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                {/* <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleEditClick(selectedDesign);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button> */}
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (selectedDesign) {
                      handleDeleteDesign(selectedDesign.uuid);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}