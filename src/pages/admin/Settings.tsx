import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '../../components/ui/switch';

interface ConsultationMethod {
  uuid: string;
  name: string;
  is_available: boolean
}

export default function Settings() {
  const [settings, setSettings] = useState({
    area_service_cost: '',
    consulting_hourly_rate: ''
  });
  const {authFetch} = useAuthenticatedFetch()

  const [consultationMethods, setConsultationMethods] = useState<ConsultationMethod[]>([]);
  const [newMethodName, setNewMethodName] = useState('');
  const [editingMethod, setEditingMethod] = useState<ConsultationMethod | null>(null);

  useEffect(() => {
    // Fetch current settings from your API
    fetchSettings();
    fetchConsultationMethods();
  }, []);

  const fetchSettings = async () => {
    try {
      // Replace with your actual API call
      const response = await authFetch('service-settings/');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    try {
      // Replace with your actual API call
      await authFetch('service-settings/', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const fetchConsultationMethods = async () => {
    try {
      const response = await authFetch('service-methods/');
      const data = await response.json();
      setConsultationMethods(data.data);
    } catch (error) {
      toast.error('Failed to load consultation methods');
    }
  };

  const handleAddMethod = async () => {
    if (!newMethodName.trim()) {
      toast.error('Method name cannot be empty');
      return;
    }

    try {
      const response = await authFetch('service-methods/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMethodName }),
      });
      const newMethod = await response.json();
      
    //   setConsultationMethods(prev => [...prev, newMethod]);
    fetchConsultationMethods()
      setNewMethodName('');
      toast.success('Method added successfully');
    } catch (error) {
      toast.error('Failed to add method');
    }
  };

  const handleUpdateMethod = async (id: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Method name cannot be empty');
      return;
    }

    try {
      await authFetch(`service-methods/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      setConsultationMethods(methods =>
        methods.map(method =>
          method.uuid === id ? { ...method, name: newName } : method
        )
      );
      setEditingMethod(null);
      toast.success('Method updated successfully');
    } catch (error) {
      toast.error('Failed to update method');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await authFetch(`service-methods/${id}/`, {
        method: 'DELETE',
      });

      setConsultationMethods(methods =>
        methods.filter(method => method.uuid !== id)
      );
      toast.success('Method deleted successfully');
    } catch (error) {
      toast.error('Failed to delete method');
    }
  };

  const handleToggleAvailability = async (id: string, newStatus: boolean) => {
    try {
      await authFetch(`service-methods/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus }),
      });

      setConsultationMethods(methods =>
        methods.map(method =>
          method.uuid === id ? { ...method, is_available: newStatus } : method
        )
      );
      toast.success('Availability updated successfully');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area_cost">Area Service Cost (per sq. meter)</Label>
            <Input
              id="area_cost"
              type="number"
              value={settings.area_service_cost}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                area_service_cost: e.target.value
              }))}
              placeholder="Enter cost per square meter"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consulting_rate">Consulting Hourly Rate</Label>
            <Input
              id="consulting_rate"
              type="number"
              value={settings.consulting_hourly_rate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                consulting_hourly_rate: e.target.value
              }))}
              placeholder="Enter hourly rate"
            />
          </div>

          <Button onClick={handleSave} className="mt-4 text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultation Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new method name"
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
            />
            <Button className='text-white' onClick={handleAddMethod}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {consultationMethods.map((method) => (
              <div key={method.uuid} className="flex items-center gap-2 p-2 border rounded-md">
                {editingMethod?.uuid === method.uuid ? (
                  <>
                    <Input
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateMethod(method.uuid, editingMethod.name)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingMethod(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{method.name}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={method.is_available}
                        onCheckedChange={(checked:boolean) => handleToggleAvailability(method.uuid, checked)}
                      />
                      <span className={`text-sm ${method.is_available ? 'text-green-600' : 'text-gray-500'}`}>
                        {method.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingMethod(method)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMethod(method.uuid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 