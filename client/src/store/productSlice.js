// import { createSlice } from "@reduxjs/toolkit";

// const initialValue = {
//     allCategory : [],
//     loadingCategory : false,
//     allSubCategory : [],
//     product : []
// }

// const productSlice = createSlice({
//     name : 'product',
//     initialState : initialValue,
//     reducers : {
//         setAllCategory : (state,action)=>{
//             state.allCategory = [...action.payload]
//         },
//         setLoadingCategory : (state,action)=>{
//             state.loadingCategory = action.payload
//         },
//         setAllSubCategory : (state,action)=>{
//             state.allSubCategory = [...action.payload]
//         },
        
//     }
// })

// export const  { setAllCategory,setAllSubCategory,setLoadingCategory } = productSlice.actions

// export default productSlice.reducer












// client/src/store/productSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  allCategory: [],
  loadingCategory: false,
  allSubCategory: [],
  allBrands: [],
  loadingBrands: false,
  product: []
};

const productSlice = createSlice({
  name: "product",
  initialState: initialValue,
  reducers: {
    setAllCategory: (state, action) => {
      state.allCategory = [...action.payload];
    },
    setLoadingCategory: (state, action) => {
      state.loadingCategory = action.payload;
    },
    setAllSubCategory: (state, action) => {
      state.allSubCategory = [...action.payload];
    },
    setAllBrands: (state, action) => {
      state.allBrands = [...action.payload];
    },
    setLoadingBrands: (state, action) => {
      state.loadingBrands = action.payload;
    }
  }
});

export const {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory,
  setAllBrands,
  setLoadingBrands
} = productSlice.actions;

export default productSlice.reducer;