import { Button } from "../ui/button";

interface TopProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const TopProducts = () => {
  const topProducts = [
    { id: "1", name: "Product #1", price: 299, image: require('../../assets/images/images (2).jpeg') },
    { id: "2", name: "Product #2", price: 399, image:require('../../assets/images/images (2).jpeg') },
    { id: "3", name: "Product #3", price: 499, image: require('../../assets/images/images (2).jpeg') },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">TOP PRODUCT THIS WEEK</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topProducts.map((product) => (
            <div key={product.id} className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  ${product.price}
                </div>
                <div className="w-[250px] h-[250px] rounded-full border-2 border-blue-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm font-medium">{product.name}</span>
              </div>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8">
                SHOP NOW
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};