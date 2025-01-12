import ConsultionService from "../../components/services/ConsultationService";
import AreaService from "../../components/services/AreaService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import DesignService from "../../components/services/DesignService";
import ImplementationService from "../../components/services/ImplementationService";
import SuperVisionService from "../../components/services/SuperVisionService";

const AdminServices = () => {
    return (
        <Tabs defaultValue="design" className="space-y-4">
        <TabsList>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="area">Area</TabsTrigger>
          <TabsTrigger value="consulting">Consulting</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="supervision">SuperVision</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
            <DesignService/>
        </TabsContent>
        <TabsContent value="area" className="space-y-4">
            <AreaService/>
        </TabsContent>
        <TabsContent value="consulting" className="space-y-4">  
            <ConsultionService/>
        </TabsContent>
        <TabsContent value="implementation" className="space-y-4">  
            <ImplementationService/>
        </TabsContent>
        <TabsContent value="supervision" className="space-y-4">  
            <SuperVisionService/>
        </TabsContent>

        </Tabs>
    )
}

export default AdminServices;