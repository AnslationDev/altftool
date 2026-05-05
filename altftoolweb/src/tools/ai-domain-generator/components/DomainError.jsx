const DomainCard = ({ domain }) => {
  return (
    <div className="p-5 rounded-xl border-2 border-(--border) flex flex-col space-y-2 hover:shadow-lg">
      <p className="text-xl font-bold break-all text-(--foreground)">
        {domain}
      </p>
    </div>
  );
};

export default DomainCard;