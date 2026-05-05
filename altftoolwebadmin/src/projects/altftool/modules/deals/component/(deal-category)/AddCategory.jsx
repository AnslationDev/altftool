// "use client";
// import React, { useEffect, useState } from "react";
// import { categoryService } from "../../firebaseService/category.service";
// import { uploadImage } from "../../../buysmart/services/uploadImage";

// function AddCategory({ setActive }) {

//   const [categories, setCategories] = useState([]);
//   const [selected, setSelected] = useState("");

//   const [showAdd, setShowAdd] = useState(false);
//   const [name, setName] = useState("");

//   const [imageFile, setImageFile] = useState(null);
//   const [preview, setPreview] = useState("");

//   // fetch categories
//   useEffect(() => {
//     return categoryService.subscribe(setCategories);
//   }, []);

//   // handle add category
//   const handleAdd = async () => {
//     if (!name || !imageFile) {
//       alert("Name & Image required");
//       return;
//     }

//     try {
//       // upload image
//       const imageUrl = await uploadImage(imageFile);

//       // save to firestore
//       const res = await categoryService.add({
//         name,
//         image: imageUrl,
//       });

//       setSelected(res.id);
//       setName("");
//       setImageFile(null);
//       setPreview("");
//       setShowAdd(false);

//     } catch (err) {
//       console.error(err);
//       alert("Upload failed");
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded shadow space-y-4">

//       {/* HEADER */}
//       <div className="flex justify-between">
//         <h2 className="font-bold text-lg">Category</h2>
//         <button onClick={() => setActive(false)}>Cancel</button>
//       </div>

//       {/* DROPDOWN */}
//       <select
//         value={selected}
//         onChange={(e) => {
//           if (e.target.value === "add-new") {
//             setShowAdd(true);
//           } else {
//             setSelected(e.target.value);
//           }
//         }}
//         className="border p-3 w-full"
//       >
//         <option value="">Select Category</option>

//         {categories.map((c) => (
//           <option key={c.id} value={c.id}>
//             {c.name}
//           </option>
//         ))}

//         <option value="add-new">+ Add Category</option>
//       </select>

//       {/* ADD FORM */}
//       {showAdd && (
//         <div className="border p-4 space-y-3">

//           {/* NAME */}
//           <input
//             placeholder="Category Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="border p-2 w-full"
//           />

//           {/* FILE INPUT */}
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => {
//               const file = e.target.files[0];

//               if (!file) return;

//               // validate
//               if (!file.type.startsWith("image/")) {
//                 alert("Only image allowed");
//                 return;
//               }

//               setImageFile(file);
//               setPreview(URL.createObjectURL(file));
//             }}
//             className="border p-2 w-full"
//           />

//           {/* PREVIEW */}
//           {preview && (
//             <img
//               src={preview}
//               className="w-20 h-20 object-cover rounded"
//               alt="preview"
//             />
//           )}

//           {/* BUTTON */}
//           <button
//             onClick={handleAdd}
//             className="bg-black text-white px-4 py-2"
//           >
//             Add Category
//           </button>

//         </div>
//       )}
//     </div>
//   );
// }

// export default AddCategory; 


"use client";
import React, { useEffect, useState } from "react";
import { categoryService } from "../../firebaseService/category.service";
import { allBrandService } from "../../firebaseService/allBrand.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function AddCategory({ setActive , editData , setEditData }) {

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryUpload , setCategoryUpload] = useState(false)
  const [brandUpload , setBrandUpload] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);

  // category form
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState(null);
  const [catPreview, setCatPreview] = useState("");

  // brand form
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [brandPreview, setBrandPreview] = useState("");
  const [brandLink, setBrandLink] = useState("");

  // 🔹 fetch categories
  useEffect(() => {
    return categoryService.subscribe(setCategories);
  }, []);

  // 🔹 fetch brands when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setBrands([]);
      return;
    }
  
    setBrands([]); // ✅ reset
  
    return allBrandService.subscribe(selectedCategory, setBrands);
  }, [selectedCategory]);

 
  //  ADD CATEGORY
  const handleAddCategory = async () => {
    if (!catName || !catImage) {
      alert("Category name & image required");
      return;
    }
    try {
      setCategoryUpload(true)
      const imageUrl = await uploadImage(catImage);
  
    const res = await categoryService.add({
      name: catName,
      image: imageUrl,
    });
  
    setSelectedCategory(res.id);
      
    } catch (error) {
      console.error(error)
      
    } finally{
          setCategoryUpload(false)
    }
    
  };

  //  ADD BRAND
  const handleAddBrand = async () => {
    if (!brandName || !brandLogo || !brandLink) {
      alert("All brand fields required");
      return;
    }
    try {
      setBrandUpload(true)
      const logoUrl = await uploadImage(brandLogo);
  
      const res = await allBrandService.add(selectedCategory, {
        name: brandName,
        logo: logoUrl,
        link: brandLink,
      });
        
    setSelectedBrand(res.id);
      
    } catch (error) {
          console.error(error)
    } finally {
      setBrandUpload(false)
      setActive(false);

    }
   
  
   
  

  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">

      {/* CATEGORY DROPDOWN */}
      <div>
  
        <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {editData ? "Edit Category" : "Add Category & Brand Name"}
        </h2>

        <button
          onClick={() => {
            setActive(false);
            setEditData(null);
          }}
          className="px-3 py-1 border rounded hover:bg-red-500 hover:text-white"
        >
          Cancel
        </button>
      </div>
      <h3>Category</h3>
        <select
          value={selectedCategory}
          onChange={(e) => {
            if (e.target.value === "add-new") {
              setShowAddCategory(true);
            } else {
              setSelectedCategory(e.target.value);
              setShowAddCategory(false);
            }
          }}
          className="border rounded-sm p-3 w-full"
        >
          <option value="">Select Category</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

          <option value="add-new">+ Add Category</option>
        </select>
      </div>

      {/* ADD CATEGORY FORM */}
      {showAddCategory && (
        <div className="p-4 rounded-sm border">
        <div className="flex justify-between ">
          <div>
            <label htmlFor="">Category Name</label>
            <input
            placeholder="Category Name"
            value={catName}
            required
            onChange={(e) => setCatName(e.target.value)}
            className="border p-2 cursor-pointer rounded-sm w-full"
          />
          </div>
          
          <div>
            <label htmlFor="">Image *</label><br />
            <input
            type="file"
            required
            className="border cursor-pointer rounded-sm p-2 "
            onChange={(e) => {
              const file = e.target.files[0];
              setCatImage(file);
              setCatPreview(URL.createObjectURL(file));
            }}
          />
          </div>
          {catPreview && <img src={catPreview} className="w-20" />}
        </div>
         <button onClick={handleAddCategory} className="bg-black text-white px-4 py-2 cursor-pointer rounded-sm">
          {categoryUpload ? "creating...":"Add Category"}
       </button>
       </div>
        
      )}

      {/* BRAND DROPDOWN */}
      {selectedCategory && (
        <div>
          <h3>Brand</h3>

          <select
            value={selectedBrand}
            onChange={(e) => {
              if (e.target.value === "add-new") {
                setShowAddBrand(true);
              } else {
                setSelectedBrand(e.target.value);
                setShowAddBrand(false);
              }
            }}
            className="border rounded-sm p-3 w-full"
          >
            <option value="">Select Brand</option>

            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}

            <option value="add-new">+ Add Brand</option>
          </select>
        </div>
      )}

      {/* ADD BRAND FORM */}
      {showAddBrand && (
        <div className="border rounded-sm p-4 space-y-3">
          <div className="flex justify-between" >
            <div>
              <label htmlFor="">Brand Name *</label>
            <input
            placeholder="Brand Name"
            value={brandName}
            required
            onChange={(e) => setBrandName(e.target.value)}
            className="border cursor-pointer rounded-sm p-2 w-full"
          />
            </div>
            <div>
              <label htmlFor="">Brand Link *</label>
            <input
            placeholder="Brand Link"
            value={brandLink}
            required
            onChange={(e) => setBrandLink(e.target.value)}
            className="border cursor-pointer rounded-sm p-2 w-full"
          />
            </div>
          </div>
           <div>
            <label htmlFor="">Brand Logo *</label> <br />
           <input
            type="file"
            className="border cursor-pointer rounded-sm p-2 w-full"
            onChange={(e) => {
              const file = e.target.files[0];
              setBrandLogo(file);
              setBrandPreview(URL.createObjectURL(file));
              
            }}
          />
           </div>
        

          {brandPreview && <img src={brandPreview} className="w-20" />}

          <button onClick={handleAddBrand} className="bg-black text-white px-4 py-2 rounded-sm cursor-pointer ">
          {brandUpload ? "creating...":"Add Brand"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddCategory;
