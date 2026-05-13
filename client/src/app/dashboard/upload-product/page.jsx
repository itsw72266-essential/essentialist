// 'use client'
// import React, { useState, useRef } from 'react'
// import { FaCloudUploadAlt } from 'react-icons/fa'
// import uploadImage from './../../../utils/UploadImage';
// import Loading from '../../../components/Loading'
// import ViewImage from '../../../components/ViewImage'
// import { MdDelete } from 'react-icons/md'
// import { useSelector } from 'react-redux'
// import { IoClose } from 'react-icons/io5'
// import AddFieldComponent from '../../../components/AddFieldComponent'
// import Axios from '../../../utils/Axios'
// import SummaryApi from '../../../common/SummaryApi'
// import AxiosToastError from '../../../utils/AxiosToastError'
// import successAlert from './../../../utils/SuccessAlert'
// import AdminPermission from '../../../components/AdminPermission'
// import dynamic from 'next/dynamic'

// const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

// const customTabularStyles = `
//   .plain-text-area {
//     width: 100%;
//     min-height: 200px;
//     line-height: 1.8;
//     padding: 12px;
//     white-space: pre-wrap;
//     font-family: 'Courier New', monospace;
//     background-color: rgb(239 246 255);
//     border: 1px solid #e2e8f0;
//     border-radius: 0.25rem;
//     outline: none;
//     tab-size: 4;
//     font-size: 14px;
//   }
//   .plain-text-area:focus {
//     border-color: #93c5fd;
//   }
//   .tabular-display {
//     white-space: pre-wrap;
//     font-family: 'Courier New', monospace;
//     line-height: 1.8;
//     background-color: #f8fafc;
//     padding: 12px;
//     border-radius: 0.25rem;
//     border: 1px solid #e2e8f0;
//     font-size: 14px;
//     tab-size: 4;
//     overflow-x: auto;
//   }
//   .tabular-display::selection {
//     background-color: #bfdbfe;
//   }
//   .tabular-display::-moz-selection {
//     background-color: #bfdbfe;
//   }
// `

// function MarkdownPreview({ source = '' }) {
//   // Simple Markdown to HTML fallback (no external dependency)
//   // Only handles **bold**, *italic*, `code`, and basic links
//   let html = source
//     .replace(/`([^`]+)`/g, '<code>$1</code>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*([^*]+)\*/g, '<em>$1</em>')
//     .replace(
//       /\[(.*?)\]\((.*?)\)/g,
//       '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
//     )
//     .replace(/\n/g, '<br/>')
//   return (
//     <div
//       data-color-mode='light'
//       className='wmde-markdown bg-white px-2'
//       style={{ fontSize: 14 }}
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   )
// }

// const UploadProduct = () => {
//   const [data, setData] = useState({
//     name: '',
//     image: [],
//     category: [],
//     subCategory: [],
//     unit: '',
//     stock: '',
//     bulkPrice: '',
//     price: '',
//     discount: '',
//     description: '',
//     plainTextDetails: '',
//     more_details: {},
//   })
//   const [imageLoading, setImageLoading] = useState(false)
//   const [ViewImageURL, setViewImageURL] = useState('')
//   const allCategory = useSelector((state) => state.product.allCategory)
//   const [selectCategory, setSelectCategory] = useState('')
//   const [selectSubCategory, setSelectSubCategory] = useState('')
//   const allSubCategory = useSelector((state) => state.product.allSubCategory)
//   const [openAddField, setOpenAddField] = useState(false)
//   const [fieldName, setFieldName] = useState('')
//   const multipleFileInputRef = useRef(null)

//   const handleDescriptionChange = (val) => {
//     setData((prev) => ({
//       ...prev,
//       description: val || '',
//     }))
//   }

//   const handlePlainTextChange = (e) => {
//     setData((prev) => ({
//       ...prev,
//       plainTextDetails: e.target.value,
//     }))
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === 'Tab') {
//       e.preventDefault()
//       const start = e.target.selectionStart
//       const end = e.target.selectionEnd
//       const value = e.target.value
//       const newValue = value.substring(0, start) + '\t' + value.substring(end)

//       setData((prev) => ({
//         ...prev,
//         plainTextDetails: newValue,
//       }))

//       setTimeout(() => {
//         e.target.selectionStart = e.target.selectionEnd = start + 1
//       }, 0)
//     }
//   }

//   const handleMultipleUploadImages = async (e) => {
//     const files = e.target.files
//     if (!files || files.length === 0) return
//     setImageLoading(true)
//     const newImages = [...data.image]
//     for (let i = 0; i < files.length; i++) {
//       try {
//         const response = await uploadImage(files[i])
//         const { data: ImageResponse } = response
//         const imageUrl = ImageResponse.data.url
//         newImages.push(imageUrl)
//       } catch (error) {
//         console.error('Error uploading image:', error)
//       }
//     }
//     setData((prev) => ({
//       ...prev,
//       image: newImages,
//     }))
//     setImageLoading(false)
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleUploadImage = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     setImageLoading(true)
//     const response = await uploadImage(file)
//     const { data: ImageResponse } = response
//     const imageUrl = ImageResponse.data.url
//     setData((prev) => ({
//       ...prev,
//       image: [...prev.image, imageUrl],
//     }))
//     setImageLoading(false)
//   }

//   const handleDeleteImage = async (index) => {
//     data.image.splice(index, 1)
//     setData((prev) => ({
//       ...prev,
//     }))
//   }

//   const handleRemoveCategory = async (index) => {
//     data.category.splice(index, 1)
//     setData((prev) => ({
//       ...prev,
//     }))
//   }

//   const handleRemoveSubCategory = async (index) => {
//     data.subCategory.splice(index, 1)
//     setData((prev) => ({
//       ...prev,
//     }))
//   }

//   const handleAddField = () => {
//     setData((prev) => ({
//       ...prev,
//       more_details: {
//         ...prev.more_details,
//         [fieldName]: '',
//       },
//     }))
//     setFieldName('')
//     setOpenAddField(false)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const response = await Axios({
//         ...SummaryApi.createProduct,
//         data: data,
//       })
//       const { data: responseData } = response

//       if (responseData.success) {
//         successAlert(responseData.message)
//         setData({
//           name: '',
//           image: [],
//           category: [],
//           subCategory: [],
//           unit: '',
//           stock: '',
//           bulkPrice: '',
//           price: '',
//           discount: '',
//           description: '',
//           plainTextDetails: '',
//           more_details: {},
//         })
//         if (multipleFileInputRef.current) {
//           multipleFileInputRef.current.value = ''
//         }
//       }
//     } catch (error) {
//       AxiosToastError(error)
//     }
//   }

//   return (
//     <section>
//       <style>{customTabularStyles}</style>
//       <div className='p-2 bg-white shadow-md flex items-center justify-between'>
//         <h2 className='font-semibold'>Upload Product</h2>
//       </div>
//       <div className='grid p-3'>
//         <form className='grid gap-4' onSubmit={handleSubmit}>
//           <div className='grid gap-1'>
//             <label htmlFor='name' className='font-medium'>
//               Name
//             </label>
//             <input
//               id='name'
//               type='text'
//               placeholder='Enter product name'
//               name='name'
//               value={data.name}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='description' className='font-medium'>
//               Description (Markdown)
//             </label>
//             <div className='bg-blue-50 border rounded p-2'>
//               <MDEditor
//                 value={data.description}
//                 onChange={handleDescriptionChange}
//                 height={200}
//               />
//             </div>
//             {data.description && (
//               <div className='mt-2'>
//                 <label className='font-medium text-sm'>Preview:</label>
//                 <div className='bg-gray-50 border rounded p-2'>
//                   <MarkdownPreview source={data.description} />
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='plainTextDetails' className='font-medium'>
//               Product Specifications (Tabular Format)
//             </label>
//             <p className='text-sm text-gray-600 mb-2'>
//               Use Tab key to align columns. Format: "Property[Tab]Value" on each
//               line.
//               <br />
//               Example: Color[Tab]Blue, then press Enter for next line.
//             </p>
//             <textarea
//               id='plainTextDetails'
//               name='plainTextDetails'
//               value={data.plainTextDetails}
//               onChange={handlePlainTextChange}
//               onKeyDown={handleKeyDown}
//               placeholder={`Item Form\tPowder\nColor\tNatural Tan\nSkin Type\tNormal\nFinish Type\tSheer\nRecommended Uses\tConcealer`}
//               className='plain-text-area'
//             />
//             {data.plainTextDetails && (
//               <div className='grid gap-1 mt-2'>
//                 <label className='font-medium text-sm'>Preview:</label>
//                 <div className='tabular-display'>{data.plainTextDetails}</div>
//               </div>
//             )}
//           </div>
//           <div>
//             <p className='font-medium'>Image</p>
//             <div>
//               <label
//                 htmlFor='multipleProductImages'
//                 className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'
//               >
//                 <div className='text-center flex justify-center items-center flex-col'>
//                   {imageLoading ? (
//                     <Loading />
//                   ) : (
//                     <>
//                       <FaCloudUploadAlt size={35} />
//                       <p>Upload Multiple Images</p>
//                     </>
//                   )}
//                 </div>
//                 <input
//                   type='file'
//                   id='multipleProductImages'
//                   className='hidden'
//                   accept='image/*'
//                   multiple
//                   ref={multipleFileInputRef}
//                   onChange={handleMultipleUploadImages}
//                 />
//               </label>
//               <div className='flex flex-wrap gap-4'>
//                 {data.image.map((img, index) => {
//                   return (
//                     <div
//                       key={img + index}
//                       className='h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group'
//                     >
//                       <img
//                         src={img}
//                         alt={img}
//                         className='w-full h-full object-scale-down cursor-pointer'
//                         onClick={() => setViewImageURL(img)}
//                       />
//                       <div
//                         onClick={() => handleDeleteImage(index)}
//                         className='absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer'
//                       >
//                         <MdDelete />
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           </div>
//           <div className='grid gap-1'>
//             <label className='font-medium'>Category</label>
//             <div>
//               <select
//                 className='bg-blue-50 border w-full p-2 rounded'
//                 value={selectCategory}
//                 onChange={(e) => {
//                   const value = e.target.value
//                   const category = allCategory.find((el) => el._id === value)
//                   setData((prev) => ({
//                     ...prev,
//                     category: [...prev.category, category],
//                   }))
//                   setSelectCategory('')
//                 }}
//               >
//                 <option value={''}>Select Category</option>
//                 {allCategory.map((c, index) => (
//                   <option key={c._id} value={c?._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <div className='flex flex-wrap gap-3'>
//                 {data.category.map((c, index) => (
//                   <div
//                     key={c._id + index + 'productsection'}
//                     className='text-sm flex items-center gap-1 bg-blue-50 mt-2'
//                   >
//                     <p>{c.name}</p>
//                     <div
//                       className='hover:text-red-500 cursor-pointer'
//                       onClick={() => handleRemoveCategory(index)}
//                     >
//                       <IoClose size={20} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className='grid gap-1'>
//             <label className='font-medium'>Sub Category</label>
//             <div>
//               <select
//                 className='bg-blue-50 border w-full p-2 rounded'
//                 value={selectSubCategory}
//                 onChange={(e) => {
//                   const value = e.target.value
//                   const subCategory = allSubCategory.find(
//                     (el) => el._id === value
//                   )
//                   setData((prev) => ({
//                     ...prev,
//                     subCategory: [...prev.subCategory, subCategory],
//                   }))
//                   setSelectSubCategory('')
//                 }}
//               >
//                 <option value={''} className='text-neutral-600'>
//                   Select Sub Category
//                 </option>
//                 {allSubCategory.map((c, index) => (
//                   <option key={c._id} value={c?._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <div className='flex flex-wrap gap-3'>
//                 {data.subCategory.map((c, index) => (
//                   <div
//                     key={c._id + index + 'productsection'}
//                     className='text-sm flex items-center gap-1 bg-blue-50 mt-2'
//                   >
//                     <p>{c.name}</p>
//                     <div
//                       className='hover:text-red-500 cursor-pointer'
//                       onClick={() => handleRemoveSubCategory(index)}
//                     >
//                       <IoClose size={20} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='unit' className='font-medium'>
//               Unit
//             </label>
//             <input
//               id='unit'
//               type='text'
//               placeholder='Enter product unit'
//               name='unit'
//               value={data.unit}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='stock' className='font-medium'>
//               Number of Stock
//             </label>
//             <input
//               id='stock'
//               type='number'
//               placeholder='Enter product stock'
//               name='stock'
//               value={data.stock}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='bulkPrice' className='font-medium'>
//               Bulk Price
//             </label>
//             <input
//               id='bulkPrice'
//               type='number'
//               placeholder='Enter product bulk price'
//               name='bulkPrice'
//               value={data.bulkPrice}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='price' className='font-medium'>
//               Price
//             </label>
//             <input
//               id='price'
//               type='number'
//               placeholder='Enter product price'
//               name='price'
//               value={data.price}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           <div className='grid gap-1'>
//             <label htmlFor='discount' className='font-medium'>
//               Discount
//             </label>
//             <input
//               id='discount'
//               type='number'
//               placeholder='Enter product discount'
//               name='discount'
//               value={data.discount}
//               onChange={handleChange}
//               required
//               className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//             />
//           </div>
//           {Object?.keys(data?.more_details)?.map((k, index) => (
//             <div key={k + index} className='grid gap-1'>
//               <label htmlFor={k} className='font-medium'>
//                 {k}
//               </label>
//               <input
//                 id={k}
//                 type='text'
//                 value={data?.more_details[k]}
//                 onChange={(e) => {
//                   const value = e.target.value
//                   setData((prev) => ({
//                     ...prev,
//                     more_details: {
//                       ...prev.more_details,
//                       [k]: value,
//                     },
//                   }))
//                 }}
//                 required
//                 className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
//               />
//             </div>
//           ))}
//           <div
//             onClick={() => setOpenAddField(true)}
//             className=' hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'
//           >
//             Add Fields
//           </div>
//           <button className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'>
//             Create Product
//           </button>
//         </form>
//       </div>
//       {ViewImageURL && (
//         <ViewImage url={ViewImageURL} close={() => setViewImageURL('')} />
//       )}
//       {openAddField && (
//         <AddFieldComponent
//           value={fieldName}
//           onChange={(e) => setFieldName(e.target.value)}
//           submit={handleAddField}
//           close={() => setOpenAddField(false)}
//         />
//       )}
//     </section>
//   )
// }

// export default UploadProduct
















'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';

import uploadImage from '../../../utils/UploadImage';
import Loading from '../../../components/Loading';
import ViewImage from '../../../components/ViewImage';
import AddFieldComponent from '../../../components/AddFieldComponent';
import Axios from '../../../utils/Axios';
import SummaryApi from '../../../common/SummaryApi';
import AxiosToastError from '../../../utils/AxiosToastError';
import successAlert from '../../../utils/SuccessAlert';
import AdminPermission from '../../../components/AdminPermission';
import { setAllBrands, setLoadingBrands } from '../../../store/productSlice';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const customTabularStyles = `
  .plain-text-area {
    width: 100%;
    min-height: 200px;
    line-height: 1.8;
    padding: 12px;
    white-space: pre-wrap;
    font-family: 'Courier New', monospace;
    background-color: rgb(239 246 255);
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    outline: none;
    tab-size: 4;
    font-size: 14px;
  }
  .plain-text-area:focus {
    border-color: #93c5fd;
  }
  .tabular-display {
    white-space: pre-wrap;
    font-family: 'Courier New', monospace;
    line-height: 1.8;
    background-color: #f8fafc;
    padding: 12px;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    tab-size: 4;
    overflow-x: auto;
  }
  .tabular-display::selection {
    background-color: #bfdbfe;
  }
  .tabular-display::-moz-selection {
    background-color: #bfdbfe;
  }
`;

function MarkdownPreview({ source = '' }) {
  let html = source
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br/>');
  return (
    <div
      data-color-mode="light"
      className="wmde-markdown bg-white px-2"
      style={{ fontSize: 14 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const initialState = {
  name: '',
  image: [],
  category: [],
  subCategory: [],
  unit: '',
  stock: '',
  bulkPrice: '',
  price: '',
  discount: '',
  description: '',
  plainTextDetails: '',
  more_details: {},
  brandId: ''
};

const UploadProduct = () => {
  const dispatch = useDispatch();
  const {
    allCategory,
    allSubCategory,
    allBrands,
    loadingBrands
  } = useSelector((state) => state.product);

  const [data, setData] = useState(initialState);
  const [imageLoading, setImageLoading] = useState(false);
  const [viewImageURL, setViewImageURL] = useState('');
  const [selectCategory, setSelectCategory] = useState('');
  const [selectSubCategory, setSelectSubCategory] = useState('');
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const multipleFileInputRef = useRef(null);

  const selectedBrand = allBrands.find((brand) => brand._id === data.brandId) || null;

  const fetchBrands = useCallback(async () => {
    try {
      dispatch(setLoadingBrands(true));
      const response = await Axios({
        ...SummaryApi.getBrands,
        params: {
          limit: 500,
          sort: 'nameAsc',
          onlyActive: true
        }
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setAllBrands(responseData.data));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      dispatch(setLoadingBrands(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!allBrands.length) {
      fetchBrands();
    }
  }, [allBrands.length, fetchBrands]);

  const handleDescriptionChange = (value) => {
    setData((prev) => ({
      ...prev,
      description: value || ''
    }));
  };

  const handlePlainTextChange = (event) => {
    setData((prev) => ({
      ...prev,
      plainTextDetails: event.target.value
    }));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const value = event.target.value;
      const newValue = value.substring(0, start) + '\t' + value.substring(end);

      setData((prev) => ({
        ...prev,
        plainTextDetails: newValue
      }));

      setTimeout(() => {
        event.target.selectionStart = event.target.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleMultipleUploadImages = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageLoading(true);
    const newImages = [...data.image];

    for (let index = 0; index < files.length; index++) {
      try {
        const response = await uploadImage(files[index]);
        const imageUrl = response?.data?.data?.url;
        if (imageUrl) newImages.push(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setData((prev) => ({
      ...prev,
      image: newImages
    }));
    setImageLoading(false);
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const response = await uploadImage(file);
      const imageUrl = response?.data?.data?.url;
      if (imageUrl) {
        setData((prev) => ({
          ...prev,
          image: [...prev.image, imageUrl]
        }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...data.image];
    newImages.splice(index, 1);
    setData((prev) => ({
      ...prev,
      image: newImages
    }));
  };

  const handleRemoveCategory = (index) => {
    const categories = [...data.category];
    categories.splice(index, 1);
    setData((prev) => ({
      ...prev,
      category: categories
    }));
  };

  const handleRemoveSubCategory = (index) => {
    const subcategories = [...data.subCategory];
    subcategories.splice(index, 1);
    setData((prev) => ({
      ...prev,
      subCategory: subcategories
    }));
  };

  const handleAddField = () => {
    const trimmedName = fieldName.trim();
    if (!trimmedName) return;

    setData((prev) => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [trimmedName]: ''
      }
    }));
    setFieldName('');
    setOpenAddField(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setData(initialState);
    setSelectCategory('');
    setSelectSubCategory('');
    setFieldName('');
    setViewImageURL('');
    if (multipleFileInputRef.current) {
      multipleFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: {
          ...data,
          brandId: data.brandId || null
        }
      });

      const { data: responseData } = response;
      if (responseData.success) {
        successAlert(responseData.message);
        resetForm();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <AdminPermission>
      <section>
        <style>{customTabularStyles}</style>
        <div className="p-2 bg-white shadow-md flex items-center justify-between">
          <h2 className="font-semibold">Upload product</h2>
        </div>
        <div className="grid p-3">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <label htmlFor="name" className="font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter product name"
                name="name"
                value={data.name}
                onChange={handleChange}
                required
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            <div className="grid gap-1">
              <label className="font-medium">Brand</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <select
                  className="bg-blue-50 border p-2 rounded min-w-[220px]"
                  value={data.brandId}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      brandId: event.target.value
                    }))
                  }
                  disabled={loadingBrands}
                >
                  <option value="">Select brand</option>
                  {allBrands.map((brand) => (
                    <option
                      key={brand._id}
                      value={brand._id}
                      disabled={!brand.isActive}
                    >
                      {brand.name} {!brand.isActive ? '(inactive)' : ''}
                    </option>
                  ))}
                </select>
                {data.brandId && (
                  <button
                    type="button"
                    className="text-sm px-3 py-2 border border-primary-200 rounded hover:bg-primary-50"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        brandId: ''
                      }))
                    }
                  >
                    Clear brand
                  </button>
                )}
              </div>
              {selectedBrand && (
                <p className="text-xs text-gray-600">
                  Selected brand: <strong>{selectedBrand.name}</strong>
                  {selectedBrand.isFeatured && (
                    <span className="ml-2 text-yellow-600">(Featured)</span>
                  )}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <label htmlFor="description" className="font-medium">
                Description (Markdown)
              </label>
              <div className="bg-blue-50 border rounded p-2">
                <MDEditor value={data.description} onChange={handleDescriptionChange} height={200} />
              </div>
              {data.description && (
                <div className="mt-2">
                  <label className="font-medium text-sm">Preview:</label>
                  <div className="bg-gray-50 border rounded p-2">
                    <MarkdownPreview source={data.description} />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-1">
              <label htmlFor="plainTextDetails" className="font-medium">
                Product specifications (tabular format)
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Use the Tab key to align columns. Format: "Property[TAB]Value" each line.
                <br />
                Example: <code>Item Form[TAB]Powder</code>
              </p>
              <textarea
                id="plainTextDetails"
                name="plainTextDetails"
                value={data.plainTextDetails}
                onChange={handlePlainTextChange}
                onKeyDown={handleKeyDown}
                placeholder={`Item Form\tPowder\nColor\tNatural Tan\nSkin Type\tNormal\nFinish Type\tSheer\nRecommended Uses\tConcealer`}
                className="plain-text-area"
              />
              {data.plainTextDetails && (
                <div className="grid gap-1 mt-2">
                  <label className="font-medium text-sm">Preview:</label>
                  <div className="tabular-display">{data.plainTextDetails}</div>
                </div>
              )}
            </div>

            <div>
              <p className="font-medium">Images</p>
              <div>
                <label
                  htmlFor="multipleProductImages"
                  className="bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer"
                >
                  <div className="text-center flex justify-center items-center flex-col">
                    {imageLoading ? (
                      <Loading />
                    ) : (
                      <>
                        <FaCloudUploadAlt size={35} />
                        <p>Upload multiple images</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="multipleProductImages"
                    className="hidden"
                    accept="image/*"
                    multiple
                    ref={multipleFileInputRef}
                    onChange={handleMultipleUploadImages}
                  />
                </label>
                <div className="flex flex-wrap gap-4">
                  {data.image.map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      className="h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group"
                    >
                      <img
                        src={img}
                        alt={img}
                        className="w-full h-full object-scale-down cursor-pointer"
                        onClick={() => setViewImageURL(img)}
                      />
                      <div
                        onClick={() => handleDeleteImage(index)}
                        className="absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer"
                      >
                        <MdDelete />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <label className="font-medium">Category</label>
              <div>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={selectCategory}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    const category = allCategory.find((cat) => cat._id === value);
                    if (!category) return;

                    const alreadySelected = data.category.some((cat) => cat._id === category._id);
                    if (alreadySelected) return;

                    setData((prev) => ({
                      ...prev,
                      category: [...prev.category, category]
                    }));
                    setSelectCategory('');
                  }}
                >
                  <option value="">Select category</option>
                  {allCategory.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3">
                  {data.category.map((c, index) => (
                    <div
                      key={`${c._id}-${index}-productsection`}
                      className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                    >
                      <p>{c.name}</p>
                      <div className="hover:text-red-500 cursor-pointer" onClick={() => handleRemoveCategory(index)}>
                        <IoClose size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <label className="font-medium">Sub category</label>
              <div>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={selectSubCategory}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    const subCategory = allSubCategory.find((sub) => sub._id === value);
                    if (!subCategory) return;

                    const alreadySelected = data.subCategory.some((sub) => sub._id === subCategory._id);
                    if (alreadySelected) return;

                    setData((prev) => ({
                      ...prev,
                      subCategory: [...prev.subCategory, subCategory]
                    }));
                    setSelectSubCategory('');
                  }}
                >
                  <option value="" className="text-neutral-600">
                    Select sub category
                  </option>
                  {allSubCategory.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3">
                  {data.subCategory.map((sub, index) => (
                    <div
                      key={`${sub._id}-${index}-productsection`}
                      className="text-sm flex items-center gap-1 bg-blue-50 mt-2"
                    >
                      <p>{sub.name}</p>
                      <div className="hover:text-red-500 cursor-pointer" onClick={() => handleRemoveSubCategory(index)}>
                        <IoClose size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <label htmlFor="unit" className="font-medium">
                Unit
              </label>
              <input
                id="unit"
                type="text"
                placeholder="Enter product unit"
                name="unit"
                value={data.unit}
                onChange={handleChange}
                required
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="stock" className="font-medium">
                Number of stock
              </label>
              <input
                id="stock"
                type="number"
                placeholder="Enter product stock"
                name="stock"
                value={data.stock}
                onChange={handleChange}
                required
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="bulkPrice" className="font-medium">
                Bulk price
              </label>
              <input
                id="bulkPrice"
                type="number"
                placeholder="Enter product bulk price"
                name="bulkPrice"
                value={data.bulkPrice}
                onChange={handleChange}
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="price" className="font-medium">
                Price
              </label>
              <input
                id="price"
                type="number"
                placeholder="Enter product price"
                name="price"
                value={data.price}
                onChange={handleChange}
                required
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="discount" className="font-medium">
                Discount
              </label>
              <input
                id="discount"
                type="number"
                placeholder="Enter product discount"
                name="discount"
                value={data.discount}
                onChange={handleChange}
                className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
              />
            </div>

            {Object.keys(data.more_details).map((key, index) => (
              <div key={`${key}-${index}`} className="grid gap-1">
                <label htmlFor={key} className="font-medium">
                  {key}
                </label>
                <input
                  id={key}
                  type="text"
                  value={data.more_details[key]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setData((prev) => ({
                      ...prev,
                      more_details: {
                        ...prev.more_details,
                        [key]: value
                      }
                    }));
                  }}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setOpenAddField(true)}
              className="hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded"
            >
              Add fields
            </button>

            <button className="bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold">
              Create product
            </button>
          </form>
        </div>

        {viewImageURL && <ViewImage url={viewImageURL} close={() => setViewImageURL('')} />}

        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </section>
    </AdminPermission>
  );
};

export default UploadProduct;
