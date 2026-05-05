"use client";

export default function TablePagination({
  page,
  totalPages,
  setPage
}) {

  if(totalPages <= 1) return null;

  return (

    <div className="flex justify-between items-center pt-4">

      <button
        className="btn"
        disabled={page === 1}
        onClick={()=>setPage(page-1)}
      >
        Previous
      </button>

      <div className="text-sm">
        Page {page} of {totalPages}
      </div>

      <button
        className="btn"
        disabled={page === totalPages}
        onClick={()=>setPage(page+1)}
      >
        Next
      </button>

    </div>
  );
}