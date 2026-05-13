// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name : {
//         type : String,
//         required : [true,"Provide name"]
//     },
//     email : {
//         type : String,
//         required : [true, "provide email"],
//         unique : true
//     },
//     password : {
//         type : String,
//         required : [true, "provide password"]
//     },
//     avatar : {
//         type : String,
//         default : ""
//     },
//     mobile : {
//         type : Number,
//         default : null
//     },
//     refresh_token : {
//         type : String,
//         default : ""
//     },
//     verify_email : {
//         type : Boolean,
//         default : false
//     },
//     last_login_date : {
//         type : Date,
//         default : ""
//     },
//     status : {
//         type : String,
//         enum : ["Active","Inactive","Suspended"],
//         default : "Active"
//     },
//     address_details : [
//         {
//             type : mongoose.Schema.ObjectId,
//             ref : 'address'
//         }
//     ],
//     shopping_cart : [
//         {
//             type : mongoose.Schema.ObjectId,
//             ref : 'cartProduct'
//         }
//     ],
//     orderHistory : [
//         {
//             type : mongoose.Schema.ObjectId,
//             ref : 'order'
//         }
//     ],
//     forgot_password_otp : {
//         type : String,
//         default : null
//     },
//     forgot_password_expiry : {
//         type : Date,
//         default : ""
//     },
//     role : {
//         type : String,
//         enum : ['ADMIN',"USER"],
//         default : "USER"
//     }
// },{
//     timestamps : true
// })

// const UserModel = mongoose.model("User",userSchema)

// export default UserModel




import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic info
    name: {
      type: String,
      required: [true, "Provide name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Provide email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Provide password"],
    },
    avatar: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: null,
    },

    // Auth & verification
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },

    // Status & roles
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },

    // Relations
    address_details: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "address",
        },
      ],
      default: [],
    },
    shopping_cart: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "cartProduct",
        },
      ],
      default: [],
    },
    orderHistory: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "order",
        },
      ],
      default: [],
    },

    // Password recovery
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Explicitly index email for uniqueness and faster queries
userSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;