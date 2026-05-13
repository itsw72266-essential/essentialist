import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js"; 


export const addAddressController = async(request, response) => {
    try {
        // If not logged in, userId will be undefined or null
        const userId = request.userId; // undefined for guests
        const { name, customer_email, address_line, city, state, country, pincode, mobile } = request.body;

        const createAddress = new AddressModel({
            name,
            customer_email,
            address_line,
            city,
            state,
            country,
            pincode,
            mobile,
            userId: userId || undefined // only assign if present
        });

        const saveAddress = await createAddress.save();

        // Only link address to user if logged in
        if (userId) {
            await UserModel.findByIdAndUpdate(userId, {
                $push: { address_details: saveAddress._id }
            });
        }

        return response.json({
            message: "Address Created Successfully",
            error: false,
            success: true,
            data: saveAddress
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const getAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware auth

        const data = await AddressModel.find({ userId : userId }).sort({ createdAt : -1})

        return response.json({
            data : data,
            message : "List of address",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const updateAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware auth 
        const { _id, address_line,city,state,country,pincode, mobile } = request.body 

        const updateAddress = await AddressModel.updateOne({ _id : _id, userId : userId },{
            name : request.body.name || "",
            customer_email : request.body.customer_email || "",
            address_line,
            city,
            state,
            country,
            mobile,
            pincode
        })

        return response.json({
            message : "Address Updated",
            error : false,
            success : true,
            data : updateAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteAddresscontroller = async(request,response)=>{
    try {
        const userId = request.userId // auth middleware    
        const { _id } = request.body 

        const disableAddress = await AddressModel.updateOne({ _id : _id, userId},{
            status : false
        })

        return response.json({
            message : "Address remove",
            error : false,
            success : true,
            data : disableAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}