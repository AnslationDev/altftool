import { Globe } from "lucide-react";

const DomainEmpty = () => {
  return (
    <div className="text-center py-12">
      <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-muted-foreground">
        Enter a keyword above to find your perfect domain name
      </p>
    </div>
  );
};

export default DomainEmpty;