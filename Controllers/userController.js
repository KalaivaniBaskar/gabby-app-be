import { User } from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
}); 

// register new user 
export const handleRegisterUser = async(req, res) => {

    try{
    const new_User  = {...req.body};
    if(!new_User){
        res.status(400).send({message: "User Details not received"})
    }
   
    const found = await User.find({email: new_User.email}) 
    //console.log(found.length);
    if(!found.length){
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(new_User.password, salt); 
        const hashedUser = await { ...new_User, password: hashedPassword };
        let addUser = new User({...hashedUser})
        const result= await addUser.save();
        //console.log(result);
        if(!result){
          return res.status(400)
              .json({message:"Error adding user"})
        }            

        res.status(201).json({message:"Acoount created"});
    }
    else {
        res.status(409).send({message: "Email already in use"})
    }
  }
  catch(error){
    res.status(500).send({message: "Internal server error", error: error})
  }
} 

//User Login
export const handleLogin = async(req,res) => {
    try{
      const { email, password } = req.body;
      //console.log(req.body);

      if (!email || !password) 
      return res.status(400).json({ message: 'Email and password are required.' });
  
      const foundUser = await User.findOne({email : email})
      //console.log(foundUser);
      if (!foundUser) return res.status(404).json({message: "User not found"}); //Not found 
      
      // evaluate password 
      const validPwd = await bcrypt.compare(password, foundUser.password); 
  
      if (validPwd) {
          // create JWTs
          const accessToken = jwt.sign(
              {
                  "userDetail": {
                      "email": foundUser.email,
                      "role": foundUser.role
                  }
              },
              process.env.USER_ACCESS_TOKEN_SECRET,
              { expiresIn: '3h' }
          );
          const userdata = {
              id : foundUser._id,
              username: foundUser.username,
              email : foundUser.email,
              role: foundUser.role,
              contacts: foundUser.contacts,
              pic_URL : foundUser.pic_URL,
              pic_URL_ID : foundUser.pic_URL_ID,
              phone: foundUser.phone ? foundUser.phone : ""
          }
          res.status(200).json({ accessToken, userdata });
      }
      else {
          res.status(401).json({message : "Invalid Credentials"});
      }
  }
  catch(error){
      res.status(500).send({message: "Internal server error", error: error})
    }
  }

  //Update Avatar 
export const handleAvatar = async(req,res) => {
    try{
     console.log("profile pic")
          const {email, pic_URL, pic_URL_ID} = req.body;
           // console.log(req.body)
          if(!email || !pic_URL || !pic_URL_ID)
          return res.status(400).json({message:"Invalid data"})
 
          const result = await User.findOneAndUpdate(
             {email: email},
             {pic_URL : pic_URL, pic_URL_ID: pic_URL_ID},
             {new:true}
          ) 
         // console.log(result)
          if(result){
             res.status(200).json({message: "Profile Pic updated"})
          }
    }
    catch(error){
     res.status(500).send({message: "Internal server error", error: error})
 } 
 } 

 //  Delete old pic from Cloudinary
export const deleteOldPic = async(req,res) => {
    console.log("cloudinary")
    const {public_id} = req.query
    //console.log( req.query, public_id);
    const imgID = public_id;
    try{
    const response = await cloudinary.uploader.destroy(imgID)
    //console.log(response); 
    if(response.result === 'ok')
    res.status(200).send({respCloud: response.result}) 
    else 
    res.status(404).send({respCloud: response.result}) 
    }
    catch(err){
        res.status(500).send({respCloud: response.status, error: err}) 
    }
}

 //Update Contact 
 export const handleAddContact = async(req,res) => {
    try{
     console.log("contacts ")
          const {email,  addEmail} = req.body;
           // console.log(req.body)
          if(!email )
          return res.status(400).json({message:"Invalid data"})
          
          const foundUser = await User.findOne({email : addEmail})
         //console.log(foundUser);
         if (!foundUser) 
         return res.status(404).json({message: "User not found"}); //Not found 
           
          const result = await User.findOneAndUpdate(
             {email: email},
             {$push : {contacts: addEmail}},
             {new:true}
          ) 
         console.log(result)
          if(result){
             res.status(200).json({message: "Contacts Updated" , contacts : result.contacts})
          }
    }
    catch(error){
     res.status(500).send({message: "Internal server error", error: error})
 } 
 } 

 //Fetch ContactList
 export const handleGetContacts = async(req,res) => {
    try{
     console.log(" getcontacts ")
          const {contacts} = req.body;
            //console.log(req.body,contacts)
          if(!contacts.length )
          return res.status(400).json({message:"Invalid data"})
          
          const contactList = await User.find({email: { $in : contacts}}, 
            {email:1, username:1, _id:1, pic_URL: 1})
         //console.log(contactList);
         if (!contactList.length) 
         return res.status(404).json({message: "User not found"}); //Not found 
           
             res.status(200).json({message: "Contacts fetched" , 
             contactList})
    }
    catch(error){
     res.status(500).send({message: "Internal server error", error: error})
 } 
 } 
