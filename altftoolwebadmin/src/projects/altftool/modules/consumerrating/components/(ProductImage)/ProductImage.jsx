"use client";

import React, { useState } from "react";
import AddProductImage from "./AddProductImage";
import GetProductImage from "./GetProductImage";

function ProductImage() {
  const [active, setActive] = useState(false);
  const [editData, setEditData] = useState(null);

  return (
    <div className="space-y-6">

      {!active && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setActive(true);
              setEditData(null);
            }}
            className="btn btn-primary"
          >
            Add Product Image +
          </button>
        </div>
      )}

      {active ? (
        <AddProductImage
          setActive={setActive}
          editData={editData}
          setEditData={setEditData}
        />
      ) : (
        <GetProductImage
          setActive={setActive}
          setEditData={setEditData}
        />
      )}
    </div>
  );
}

export default ProductImage;